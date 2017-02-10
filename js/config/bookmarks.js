define([
    'dojo/i18n!./nls/main'
], function (i18n) {

    return {
        map: true,
        editable: true,
        bookmarks: [
            {
                extent: {
                  xmin: -13103005,
                  ymin: 3846162,
                  xmax: -12933468,
                  ymax: 3908687,
                  spatialReference: {
                    wkid: 102100
                  }
                },
                name: i18n.bookmarks.sd
            }
        ]
    };
});