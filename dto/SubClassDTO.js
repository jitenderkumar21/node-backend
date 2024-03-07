
/**
 * Data Transfer Object (DTO) representing sub-class information.
 */
class SubClassDTO {
    /**
     * @param {string} classId - The ID of the class.
     * @param {string} subClassId - The ID of the sub-class.
     * @param {string} teacherName - The name of the teacher.
     * @param {string} teacherEmail - The email of the teacher.
     * @param {string} teacherTimezone - The timezone of the teacher.
     * @param {string} classMaterial - The material for the class.
     * @param {string} prerequisite - The prerequisite for the sub-class
     * @param {string} zoomMeetingLink - The Zoom meeting link.
     * @param {string} meetingId - The meeting ID.
     * @param {string} passcode - The passcode for the meeting.
     */
    constructor(
      classId,
      subClassId,
      teacherName,
      teacherEmail,
      teacherTimezone,
      classMaterial,
      prerequisite,
      zoomMeetingLink,
      meetingId,
      passcode
    ) {
      this.classId = classId;
      this.subClassId = subClassId;
      this.teacherName = teacherName;
      this.teacherEmail = teacherEmail;
      this.teacherTimezone = teacherTimezone;
      this.classMaterial = classMaterial;
      this.prerequisite = prerequisite;
      this.zoomMeetingLink = zoomMeetingLink;
      this.meetingId = meetingId;
      this.passcode = passcode;
    }
  }
  
module.exports = SubClassDTO;
  