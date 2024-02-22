const moment = require('moment-timezone');

class subClassUtility {
    static getClassId(subClassId, classTag) {
        const lowercaseClassTag = classTag.toLowerCase();

        if (lowercaseClassTag === 'ongoing' || lowercaseClassTag === 'course') {
            return subClassId;
        } else {
            // Remove _ followed by a number from the end of subClassId
            return subClassId.replace(/_\d+$/, '');
        }
    }
    static getdateMonthAndDay(classStartTime){
        classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        const dayAndMonth = classStartTime.format('D MMMM, dddd');
        return dayAndMonth;
    }
    static getModifiedClassName(subClassId,className,classTag){
        const lowercaseClassTag = classTag.toLowerCase();
        const classNumber = subClassId.split('_')[1];
        if (lowercaseClassTag === 'ongoing' || lowercaseClassTag === 'course') {
            return `${className}-Class ${classNumber}`;
        } else {
            return className;
        }
    }
    static getModifiedClassNameV2(subClassId,className,classTag){
        const lowercaseClassTag = classTag.toLowerCase();
        const classNumber = subClassId.split('_')[1];
        if (lowercaseClassTag === 'ongoing' || lowercaseClassTag === 'course') {
            return `Class ${classNumber} : ${className}`;
        } else {
            return className;
        }
    }
    static getPSTTiming(classStartTime,classEndTime){
        classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        classStartTime =  classStartTime.format('h:mm A');
        classEndTime =  classEndTime.format('h:mm A');
        return `PST : ${classStartTime} - ${classEndTime}`;
    }
    static getESTTiming(classStartTime,classEndTime){
        classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
        classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
        classStartTime =  classStartTime.format('h:mm A');
        classEndTime =  classEndTime.format('h:mm A');
        return `EST : ${classStartTime} - ${classEndTime}`;
    }
    // eg. EST : 10:00 PM - 11:00 PM
    static getCSTTiming(classStartTime,classEndTime){
        classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
        classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
        classStartTime =  classStartTime.format('h:mm A');
        classEndTime =  classEndTime.format('h:mm A');
        return `CST : ${classStartTime} - ${classEndTime}`;
    }

    static getClassStartTime(timeZoneAbbreviation,classStartTime,classEndTime){
        let offset = 8;
        if(timeZoneAbbreviation=='MST'){
            offset=7;
        }else if(timeZoneAbbreviation=='EST'){
            offset=5;
        }else if(timeZoneAbbreviation=='CST'){
            offset=6;
        }
        classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(offset, 'hours');
        classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(offset, 'hours');
        classStartTime =  classStartTime.format('h:mm A');
        classEndTime =  classEndTime.format('h:mm A');
        return `${timeZoneAbbreviation} : ${classStartTime} - ${classEndTime}`;

    }

    static getClassDisplayTiming(userTimeZone,classStartTime,classEndTime){
        let timeZoneAbbreviation = 'PST';
        userTimeZone = moment.tz([2023, 0], userTimeZone).zoneAbbr();
        
        if(userTimeZone === 'EST'){
            classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
            classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(5, 'hours');
            timeZoneAbbreviation = 'EST';
        }else if(userTimeZone === 'CST'){
            classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
            classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(6, 'hours');
            timeZoneAbbreviation = 'CST';
        }else if(userTimeZone === 'MST'){
            classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
            classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(7, 'hours');
            timeZoneAbbreviation = 'MST';
        }else{
            classStartTime = moment(classStartTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
            classEndTime = moment(classEndTime, 'YYYY-MM-DD HH:mm').subtract(8, 'hours');
        }
        let displayClassTime = '';
        if (classStartTime.isValid() && classEndTime.isValid()) {
            const formattedClassStartTime = classStartTime.format('D MMM, ddd, h:mm A');
            const formattedClassEndTime = classEndTime.format('h:mm A');
            displayClassTime = `${formattedClassStartTime} - ${formattedClassEndTime} (${timeZoneAbbreviation})`;
        }
        return displayClassTime;
}

    
}

module.exports = subClassUtility;
