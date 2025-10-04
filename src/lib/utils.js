

var screens = [];
var menuItems = [];

const addScreen = function(name,form) {
    screens.push({
        name: name,
        form: form
    })
}

const getScreenByName = function(name) {
    var retVal = false;
    for (var i in screens) {
        if (screens[i].name == name) {
            retVal = screens[i].form;
        }
    }
    return retVal;
}

const addMenuItem = function(title,route,icon) {
    menuItems.push({
        title: title,
        link: route,
        icon: icon
    })
}

const getMenuItems = function(name) {
    return menuItems;
}

export { getScreenByName, addScreen, addMenuItem, getMenuItems };