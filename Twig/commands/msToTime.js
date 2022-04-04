
module.exports = {
    "name": "msToTime",
    
    execute(ms) {
        let milliseconds = Math.round(ms)
        let seconds = Math.round(ms / 1000)
        let minutes = Math.round(ms / (1000 * 60))
        let hours = Math.round(ms / (1000 * 60 * 60))
        let days = Math.round(ms / (1000 * 60 * 60 * 24))
        let weeks = Math.round(ms / (1000 * 60 * 60 * 24 * 7))
        let months = Math.round(ms / (1000 * 60 * 60 * 24 * 7 * 4))
        let years = Math.round(ms / (1000 * 60 * 60 * 24 * 7 * 4 * 12))
        if(milliseconds < 1000){
            if (milliseconds == 1) {
                return milliseconds + " Millisecond"
            }
            return milliseconds + " Milliseconds"
        }else if (seconds < 60){
            if (seconds == 1) {
                return seconds + " Second"
            }
            return seconds + " Seconds"
        }else if (minutes < 60){
            if (minutes == 1) {
                return minutes + " Minute"
            }
            return minutes + " Minutes"
        }else if (hours < 24){
            if (hours == 1) {
                return hours + " Hour"
            }
            return hours + " Hours"
        } else if (days < 7){
            if (days == 1) {
                return days + " Day"
            }
            return days + " Days"
        } else if (weeks < 4){
            if (weeks == 1) {
                return weeks + " Week"
            }
            return weeks + " Weeks"
        } else if (months < 12){
            if (months == 1) {
                return months + " Month"
            }
            return months + " Months"
        } else {
            if (years == 1) {
                return years + " Year"
            }
            return years + " Years"
        }
    }
}