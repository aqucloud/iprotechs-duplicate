
$(document).ready(function () {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 120) {
            $('header').addClass('fixed');
        } else {
            $('header').removeClass('fixed');
        }
    });
    $(".right-side-click").click(function () {
        $(".right-side-drawer").addClass("active");
        $("body").addClass("active");
    });
    $(".close-right-side-drawer").click(function () {
        $(".right-side-drawer").removeClass("active");
        $("body").removeClass("active");
    });
    $(".mobile-menu-click").click(function () {
        $(".site-menu").addClass("active");
    });
    $(".site-menu-close").click(function () {
        $(".site-menu").removeClass("active");
    });
    // $(".tab-click-list li").click(function () {
    //     //alert("Click to close");
    //     var link = $(this).attr("rel");
    //     $currentWidget = ("#"+link);
    //     console.log($currentWidget);
    //     $(".tab-click-list li").removeClass("active");
    //     $(this).addClass("active");
    //     $("tab-content-desc").hide();
    //     $currentWidget.fadeIn(500);
    // });

    $(".tab-click-list li").click(function () {
        var link = $(this).attr("rel");
        $current = $("#"+link);
        $(this).siblings(".tab-click-list li").removeClass("active");
        $(this).addClass("active");
        $current.siblings(".tab-content-desc").hide();
        $current.fadeIn();
      });
})

