/**
 * Created by igor on 22.11.16.
 */

function StarWarsHeroes(container) {
    this.container = container;
    this.langdata = {};
    this.heroCache = {};
    this.filmsCache = {};
    this.currentId = null;
    this.initialRequest = true;
}

StarWarsHeroes.prototype = {
    init: function() {
        var self = this;

        this.wrap = StarWarsHeroes.createElement('div', {
            className: 'wrap',
            innerHTML: '<h1 class="header">' + this.getLang('star_wars_heroes') + '</h1>' +
            '<div class="contents"></div>'
        }, null, this.container);

        this.contents = this.container.querySelector(".contents");

        this.progressBar = StarWarsHeroes.createElement('div', {
            className: 'swh-progress-bar'
        }, {width: '0px'}, this.container);

        window.addEventListener('hashchange', function() {
            self.setHeroByHash();
        });

        window.addEventListener('resize', function() {
            self.resize();
        });

        this.setHeroByHash();
        this.resize();
    },

    setLang: function(data, value) {
        if (value === undefined) {
            return Object.assign(this.langdata, data);
        } else {
            return this.langdata[data] = value;
        }
    },

    getLang: function(name) {
        return this.langdata[name] || name;
    },

    setAvatar: function(image) {
        this.avatarWrap.innerHTML = '<img src="' + image + '">';
    },

    prev: function() {
        if (this.currentId <= StarWarsHeroes.MIN_PEOPLE_ID || this._inLoad) return false;
        this.dir = -1;
        this.setHeroHash(this.currentId - 1);
        this.navWrap.classList.add('loading-prev');
    },

    next: function() {
        if (this.currentId >= StarWarsHeroes.MAX_PEOPLE_ID || this._inLoad) return false;
        this.dir = 1;
        this.setHeroHash(this.currentId + 1);
        this.navWrap.classList.add('loading-next');
    },

    loadHero: function(id) {
        var self = this;
        this._inLoad = true;
        self.setLoading(0);
        if (this.heroCache[id] === undefined) {
            this.getJSON("people", id, function (data) {
                if (self.currentId > id) {
                    self.dir = -1;
                } else {
                    self.dir = 1;
                }
                self.currentId = id;
                self.setLoading(1 / (data.films.length + 1));
                self.parseHero(data);
                self.setHeroHash(id);
                self.updateNavBtns();
            });
        } else {
            this.currentId = id;
            this.setLoading(1 / (this.heroCache[id].films.length + 1));
            this.parseHero(this.heroCache[id]);
            this.setHeroHash(id);
            this.updateNavBtns();
        }
    },

    getJSON: function(name, id, callback) {
        var request = new XMLHttpRequest(), url, self = this;
        if (typeof id === "function") {
            url = name;
            callback = id;
        } else {
            url = "http://swapi.co/api/" + name + "/" + id + "/";
        }
        request.open('GET', url);
        request.onreadystatechange = function() {
            if (request.readyState != 4) return;
            if (request.status == 200) {
                var data = JSON.parse(request.responseText);
                callback(data);
            } else if (request.status == 404 && self.initialRequest && name === "people") {
                self.loadHero(1);
            }
        };
        request.send(null);
    },

    parseHero: function(data) {
        this.createContent();
        if (this.dir == -1) {
            this.contents.insertBefore(this.content, this.contents.childNodes[0]);
            this.contents.style.marginLeft = - this.width + 26 + 'px';
        }
        this.resize();
        for (var name in data) {
            if (StarWarsHeroes.showingParams.indexOf(name) >= 0) {
                StarWarsHeroes.createElement('div', {
                    innerHTML: this.getLang(name) + ': ' + data[name]
                }, null, this.column2);
            }
        }
        if ("films" in data) {
            var self = this;
            data["_reqFilms"] = data.films.length;
            data.films.forEach(function(film) {
                if (self.filmsCache[film] === undefined) {
                    self.filmsCache[film] = {req: true, waiters: []};
                    self.filmsCache[film].waiters.push(function() {
                        data["_reqFilms"]--;
                        self.setLoading(1 - (data["_reqFilms"] / (data.films.length + 1)));
                        if (!data["_reqFilms"]) {
                            self.parseFilms(data.films);
                        }
                    });
                    self.getJSON(film, function (filmData) {
                        self.filmsCache[film].data = filmData;
                        self.filmsCache[film].waiters.forEach(function(waiter) {
                            waiter();
                        });
                        self.filmsCache[film].req = false;
                    });
                } else if (self.filmsCache[film].req && self.filmsCache[film].data === undefined) {
                    self.filmsCache[film].waiters.push(function() {
                        data["_reqFilms"]--;
                        self.setLoading(1 - (data["_reqFilms"] / data.films.length));
                        if (!data["_reqFilms"]) {
                            self.parseFilms(data.films);
                        }
                    });
                } else {
                    data["_reqFilms"]--;
                }
            });
            if (!data["_reqFilms"]) {
                this.parseFilms(data.films);
                this.setLoading(1);
            }
        }

        if (this.initialRequest)
            this.initialRequest = false;
        this.heroCache[this.currentId] = data;
    },

    parseFilms: function(data) {
        var cur, self = this;

        data.forEach(function(name) {
            cur = self.filmsCache[name].data;
            StarWarsHeroes.createElement('div', {
                innerHTML: self.getLang("episode") + " " + cur.episode_id + ": " + cur.title
            }, null, self.column3);
        });
    },

    setHeroByHash: function() {
        var loc = document.location.href.split('#');
        if (!loc[1]) loc.pop();
        if (loc.length <= 1 && !this.initialRequest) return;
        else if (loc.length <= 1) return this.setHeroHash(1);
        var hash = loc[1];
        var match = hash.match(/^hero\/([0-9]+)$/);
        if (match && match[1] !== undefined) {
            this.loadHero(parseInt(match[1]));
        }
    },

    setHeroHash: function(value) {
        var newHash = 'hero/' + value;
        if (document.location.hash != newHash) {
            document.location.hash = newHash;
        }
    },

    updateNavBtns: function() {
        if (this.currentId == StarWarsHeroes.MAX_PEOPLE_ID) {
            this.navWrap.classList.add('disable-next');
        } else {
            this.navWrap.classList.remove('disable-next');
        }
        if (this.currentId == StarWarsHeroes.MIN_PEOPLE_ID) {
            this.navWrap.classList.add('disable-prev');
        } else {
            this.navWrap.classList.remove('disable-prev');
        }
    },

    setLoading: function(status) {
        var self = this;
        if (status === 1) {
            this._inLoad = false;
            var cl = this.navWrap.classList;
            cl.remove('loading-prev', 'loading-next');
            this.progressBar.style.opacity = 0;
            setTimeout(function() {
                self.progressBar.style.display = 'none';
                self.progressBar.style.width = '0%';
            }, 1000);
            var contents = this.contents.querySelectorAll(".content");

            if (contents.length >= 2) {
                self.contents.classList.add('animated');
                self.contents.style.marginLeft = self.dir == 1 ? -self.width + 26 + 'px' : '0px';
                if (self.dir == 1) {
                    contents[0].style.opacity = 0;
                } else {
                    contents[contents.length - 1].style.opacity = 0;
                }
                setTimeout(function () {
                    while (self.contents.childNodes.length > 1) {
                        for (var i = self.dir == 1 ? 0 : 1; i < contents.length - (self.dir == 1 ? 1 : 0); i++) {
                            self.contents.removeChild(contents[i]);
                        }
                    }
                    self.contents.style.marginLeft = '0px';
                    self.content.style.opacity = 1;
                    self.contents.classList.remove('animated');
                }, 600);
            }
        } else {
            this.progressBar.style.display = 'block';
            this.progressBar.style.opacity = 1;
        }
        this.progressBar.style.width = status * 100 + '%';
    },

    resize: function() {
        var width = this.width = parseInt(window.getComputedStyle(this.wrap).width);
        var contentAll = this.contents.querySelectorAll('.content');
        contentAll.forEach(function(cont) {
            cont.style.width = width - 26 + 'px';
        });
    },

    createContent: function() {
        var self = this;
        this.content = StarWarsHeroes.createElement('div', {
            className: 'content'
        }, null, this.contents);

        this.column1 = StarWarsHeroes.createElement('div', {
            className: 'column avatar',
            innerHTML: '<div class="avatar-wrap"></div>\
            <nav class="heroes-nav">\
                <ul class="nav">\
                    <li class="prev">&laquo; Prev</li>\
                    <li class="next">Next &raquo;</li>\
                </ul>\
            </nav>'
        }, null, this.content);

        this.avatarWrap = this.column1.querySelector(".avatar-wrap");
        this.navWrap = this.column1.querySelector("ul.nav");

        this.prevButton = this.column1.querySelector(".prev");
        this.nextButton = this.column1.querySelector(".next");

        this.column2 = StarWarsHeroes.createElement('div', {
            className: 'column hero-passport'
        }, null, this.content);

        this.column3 = StarWarsHeroes.createElement('div', {
            className: 'column hero-episodes'
        }, null, this.content);

        this.prevButton.addEventListener('click', function() {
            return self.prev();
        });

        this.nextButton.addEventListener('click', function() {
            self.next();
        });

        this.setAvatar('images/ava.png');
    }
}

StarWarsHeroes.MIN_PEOPLE_ID = 1;
StarWarsHeroes.MAX_PEOPLE_ID = 88;
StarWarsHeroes.showingParams = "birth_year eye_color gender hair_color height mass name skin_color".split(" ");
StarWarsHeroes.createElement = function(tagName, attrs, styles, parent) {
    var el = document.createElement(tagName);
    if (attrs) Object.assign(el, attrs);
    if (styles) Object.assign(el.style, styles);
    if (parent) parent.appendChild(el);
    return el;
}