        var language;

        window.onload = getLanguage;
        function getLanguage() {
            localStorage.getItem('language') == null ? setLanguage('en') : localStorage.getItem('language');
            document.getElementsByClassName('selectedLanguage')[0].innerText = localStorage.getItem('language');
        $.ajax({ 
        url:  'assets/lang/' +  localStorage.getItem('language') + '.json', 
        dataType: 'json', async: false, dataType: 'json', 
        success: function (lang) { language = lang } });
            $('.agenda').text(language.agenda);
            $('.resource-center').attr("text", language.agenda);
            $('.exxhibition').text(language.exxhibition);
            $('.enterence').attr("text", language.exxhibition);
            $('.symposium').text(language.symposium);
            $('.exhibition').attr("text", language.symposium);
            $('.helpdesk').attr("text", language.helpdesk);
            $('.clickheretoview').text(language.clickheretoview);
            $('.lobby').text(language.lobby);
            $('.day1').text(language.day1);
            $('.breakout1').text(language.breakout1);
            $('.breakout2').text(language.breakout2);
            $('.treatmenttrouble').text(language.treatmenttrouble);
            $('.practicemanagement').text(language.practicemanagement);
            $('.mainsession').text(language.mainsession);
            $('.teens').text(language.teens);
            $('.adultaesthetics').text(language.adultaesthetics);
            $('.joinsession').text(language.joinsession);
            $('.day2').text(language.day2);
	$('.Waitingforthe').text(language.Waitingforthe);
            $('.shanchor').text(language.shanchor);
            $('.exphall').text(language.exphall);
        }

        function setLanguage(lang) {
           
        localStorage.setItem('language', lang);
        getLanguage()
        }