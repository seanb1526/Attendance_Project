import axios from './axios';

/**
 * Checks if a faculty member is also an admin
 * @param {string} facultyId - The ID of the faculty member
 * @returns {Promise<{isAdmin: boolean, adminRole: string|null, adminId: string|null}>}
 */
export const checkFacultyAdminStatus = async (facultyId) => {
  try {
    if (!facultyId) {
      return { isAdmin: false, adminRole: null, adminId: null };
    }

    // Fix API endpoint: change facultys to faculty
    const facultyResponse = await axios.get(`/api/faculty/${facultyId}/`);
    const facultyEmail = facultyResponse.data.email;

    // Use the email to find if they have an admin account
    const adminsResponse = await axios.get('/api/admins/');
    const adminAccount = adminsResponse.data.find(admin => 
      admin.email === facultyEmail
    );

    if (adminAccount) {
      return {
        isAdmin: true,
        adminRole: adminAccount.role,
        adminId: adminAccount.id
      };
    }

    return { isAdmin: false, adminRole: null, adminId: null };
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { isAdmin: false, adminRole: null, adminId: null };
  }
};

/**
 * Checks if a user has permission to edit an event
 * @param {string} eventSchoolId - The school ID of the event
 * @param {string} userFacultyId - The ID of the faculty member
 * @param {string} eventCreatorId - The ID of the faculty who created the event
 * @param {Object} adminStatus - The admin status object from checkFacultyAdminStatus
 * @returns {Promise<boolean>}
 */
export const canEditEvent = async (eventSchoolId, userFacultyId, eventCreatorId, adminStatus) => {
  console.log("canEditEvent called with:", {
    eventSchoolId,
    userFacultyId,
    eventCreatorId,
    adminStatus
  });

  // If the faculty created the event, they can edit it
  if (userFacultyId === eventCreatorId) {
    console.log("User created the event - granting permission");
    return true;
  }

  // If they're not an admin, they can't edit others' events
  if (!adminStatus || !adminStatus.isAdmin) {
    console.log("User is not an admin - denying permission");
    return false;
  }

  console.log("User is an admin with role:", adminStatus.adminRole);

  // Master and co-admins can edit any event
  if (adminStatus.adminRole === 'master' || adminStatus.adminRole === 'co') {
    console.log("User is master/co-admin - granting permission");
    return true;
  }

  // If they're a sub-admin, check if they're from the same school as the event
  if (adminStatus.adminRole === 'sub') {
    try {
      console.log("User is sub-admin - checking school match");
      
      // Get the faculty's school ID
      const facultyResponse = await axios.get(`/api/faculty/${userFacultyId}/`);
      const facultySchoolId = facultyResponse.data.school;
      
      console.log("Faculty school ID:", facultySchoolId);
      console.log("Event school ID:", eventSchoolId);
      
      // Convert both to strings for comparison to avoid type mismatches
      const facultySchoolStr = String(facultySchoolId);
      const eventSchoolStr = String(eventSchoolId);
      
      // Sub-admins can edit any event from their school
      if (facultySchoolStr === eventSchoolStr) {
        console.log("School IDs match - granting permission");
        return true;
      } else {
        console.log("School IDs don't match - denying permission");
        return false;
      }
    } catch (error) {
      console.error("Error checking event permission:", error);
      return false;
    }
  }

  console.log("No permission rules matched - denying by default");
  return false;
};
