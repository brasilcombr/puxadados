timer = {};

timer.selectors = {
    "main": "[data-timer]",
    "container": "[data-timer-container]",
    "days": "[data-timer-days]",
    "hours": "[data-timer-hours]",
    "minutes": "[data-timer-minutes]",
    "seconds": "[data-timer-seconds]",
    "textDays": "[data-timer-days-text]",
    "textHours": "[data-timer-hours-text]"
};

timer.interval = null;

timer.dataTimer = function () {
    if ($(timer.selectors.main).length > 0) {
        $(timer.selectors.main).each(function (e) {
            var days = $(this).find(timer.selectors.days);
            var hours = $(this).find(timer.selectors.hours);
            var minutes = $(this).find(timer.selectors.minutes);
            var seconds = $(this).find(timer.selectors.seconds);

            var finalDate = $(this).attr('data-timer-source');
            var txtDays = $(this).find(timer.selectors.textDays);
            var txtHours = $(this).find(timer.selectors.textHours);

            finalDate = finalDate.split(/[^0-9]/);
            finalDateYear = finalDate[0];
            finalDateMonth = finalDate[1];
            finalDateDay = finalDate[2];
            finalDateHour = finalDate[3];
            finalDateMinute = finalDate[4];
            finalDateSecond = finalDate[5];
            var finalDateObject = new Date(
                finalDateYear,
                finalDateMonth - 1,
                finalDateDay,
                finalDateHour,
                finalDateMinute,
                finalDateSecond
            );

            var date = new Date();
            if (date.getTime() >= finalDateObject.getTime()) {
                dateDays = 0;
                dateHours = 0;
                dateMinutes = 0;
                dateSeconds = 0;
                return false;
            }

            var dateYears = finalDateYear - date.getFullYear();
            var dateMonths = finalDateMonth - (date.getMonth() + 1 + (dateYears * 12));
            var dateDays = finalDateDay - date.getDate() + (dateMonths * 30);
            var dateHours = finalDateHour - date.getHours();
            var dateMinutes = finalDateMinute - date.getMinutes();
            var dateSeconds = finalDateSecond - date.getSeconds();

            if (dateSeconds < 0) {
                dateMinutes = dateMinutes - 1;
                dateSeconds = 60 + dateSeconds;
            }

            if (dateMinutes < 0) {
                dateHours = dateHours - 1;
                dateMinutes = 60 + dateMinutes;
            }

            if (dateHours < 0) {
                dateDays = dateDays - 1;
                dateHours = 24 + dateHours;
            }

            timer.interval = setInterval(function (ex) {
                var type = 0;

                if (dateSeconds == 0) {
                    if (dateMinutes > 0) {
                        type = 3;
                    } else if (dateHours > 0) {
                        type = 2;
                    } else if (dateDays > 0) {
                        type = 1;
                    } else {
                        type = 4;
                    }
                }

                switch (type) {
                    case 1:
                        dateDays = dateDays - 1;
                        dateHours = dateHours + 24;
                    case 2:
                        dateHours = dateHours - 1;
                        dateMinutes = dateMinutes + 60;
                    case 3:
                        dateMinutes = dateMinutes - 1;
                        dateSeconds = dateSeconds + 60;
                    case 0:
                        dateSeconds = dateSeconds - 1;
                        break;
                    case 4:
                        clearInterval(timer.interval);
                }

                if (dateDays == 1) {
                    txtDays.html('dia');
                } else {
                    txtDays.html('dias');
                }

                if (dateHours == 1) {
                    txtHours.html('hora');
                } else {
                    txtHours.html('horas');
                }

                dateDays = (dateDays > -1 && dateDays < 10 && dateDays.toString().length == 1) ? "0" + dateDays : dateDays;
                dateHours = (dateHours > -1 && dateHours < 10 && dateHours.toString().length == 1) ? "0" + dateHours : dateHours;
                dateMinutes = (dateMinutes > -1 && dateMinutes < 10 && dateMinutes.toString().length == 1) ? "0" + dateMinutes : dateMinutes;
                dateSeconds = (dateSeconds > -1 && dateSeconds < 10 && dateSeconds.toString().length == 1) ? "0" + dateSeconds : dateSeconds;

                days.html(dateDays);
                hours.html(dateHours);
                minutes.html(dateMinutes);
                seconds.html(dateSeconds);
            }, 1000);
        });
    }
}

timer.finish = function() {
    clearInterval(timer.interval);
    if ($(timer.selectors.main).length > 0) {
        $(timer.selectors.main).each(function (e) {
            $(this).find(timer.selectors.days).html('0');
            $(this).find(timer.selectors.hours).html('0');
            $(this).find(timer.selectors.minutes).html('0');
            $(this).find(timer.selectors.seconds).html('0');
        })
    }
}

$(function () {
    timer.dataTimer();
});