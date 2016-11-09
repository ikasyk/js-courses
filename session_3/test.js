/**
 * Created by igor on 09.11.16.
 */

/* *** 1 *** */
function compareObjects(obj1, obj2, name) {
    if (name !== undefined && obj1[name] !== undefined && obj2[name] !== undefined) {
        return obj1[name] > obj2[name] ? obj1[name] : obj2[name];
    }
}

/* *** 2 *** */
function favoriteSong(songs) {
    var maxIndex = -1, maxPlayed = 0;
    songs.forEach(function(cur, i) {
        if (cur.played > maxPlayed) {
            maxIndex = i;
            maxPlayed = cur.played;
        }
    });
    return {
        played: songs[maxIndex].played,
        name: songs[maxIndex].name,
        index: maxIndex
    };
}

/* *** 3 *** */
function Calculator() {
    this.nums = [];
    this.sum = 0;
}

Calculator.prototype = {
    add: function(x) {
        this.nums.push(x);
        this.sum += x;
    },

    getCurrentSum: function(step) {
        return this.nums.slice(0, step).reduce(function(sum, x) {
            return sum += x;
        }, 0);
    }
}

/* *** Deep Copy *** */

function deepCopy(object) {
    var newObject = {};
    for (var name in object) {
        if (typeof object[name] !== "object") {
            newObject[name] = object[name];
        } else {
            newObject[name] = deepCopy(object[name]);
        }
    }
    return newObject;
}