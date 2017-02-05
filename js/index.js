var cp = {

    scrollPoints: function() {
        var inWork = new Waypoint({
          element: document.getElementById('work'),
          handler: function(direction) {
            var el = document.getElementById('page-header');
            el.classList.toggle("in-work");
            console.log(el);
          },
          offset: -400
        });

        var inFooter = new Waypoint({
          element: document.getElementById('global-footer'),
          handler: function(direction) {
            var el = document.getElementById('page-header');
            el.classList.toggle("in-work");
            console.log(el);
          },
          offset: -400
        });
    }
}

cp.scrollPoints();