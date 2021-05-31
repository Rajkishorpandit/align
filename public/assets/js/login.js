(function($) {
    "use strict";

    /*==================================================================
              [ Focus Contact2 ]*/
    $(".input100").each(function() {
        $(this).on("blur", function() {
            if ($(this).val().trim() != "") {
                $(this).addClass("has-val");
            } else {
                $(this).removeClass("has-val");
            }
        });
    });

    /*==================================================================
              [ Validate ]*/
    var input = $(".validate-form .input");

    $(".login").click(function() {
        var check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        let email = $(".email").val();
        let password = 'align2021'; //$(".password").val();

        if (check) {
            Login(email, password, (result) => {
                var categoryId=localStorage.getItem("categoryId")
                if(categoryId === "3"){
                    location.href = "lobby1.html";
                    localStorage.setItem('href','https://forms.office.com/r/4N0Yy6navw')
                    localStorage.setItem('src','https://dpq8mnugsaz6e.cloudfront.net/images/Align VIP FF (new).png')
                }
                else{
                    location.href = "lobby1.html";
                    localStorage.setItem('href','https://forms.office.com/r/dS14BQRgkM')
                    localStorage.setItem('src','https://dpq8mnugsaz6e.cloudfront.net/images/Align FF.png')
                }
            });
        }

        return false;
    });


    $(".validate-form .input").each(function() {
        $(this).focus(function() {
            hideValidate(this);
        });
    });

    $(".validate-form .select2").each(function() {
        $(this).change(function() {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr("type") == "email" || $(input).attr("name") == "email") {
            if (
                $(input)
                .val()
                .trim()
                .match(
                    /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/
                ) == null
            ) {
                return false;
            }
        } else {
            if ($(input).val() == null || $(input).val().trim() == "") {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass("alert-validate");
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass("alert-validate");
    }
})(jQuery);

$(document).ready(function() {
    GetEventBySubdomain((data) => {
        console.log(data);
        let bannerurl =
            apiBaseUrl + "Documents/Events/" + data.id + "/" + data.bannerUrl;

        document.title = data.title;
        $(".event-title").text(data.title);
        $(".banner-bg").css("background-image", "url('" + bannerurl + "')");
    });
});