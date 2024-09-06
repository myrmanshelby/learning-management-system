import { RequestHandler } from "express";
import * as data from "../../models/firebase-types";
import { setUser, getClass, updateClass } from "../../firebase/index.js";

export const signUp: RequestHandler = async (req, res) => {
    const classID = req.body.classid
    const newUser: data.User = {
        userID: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        email: req.body.email,
        userType: req.body.userType // Ensure userType is included in the request body
    };

    const classData: data.Class = await getClass(classID);
    let studentIDs: string[] = classData.students;
    let teacherIDs: string[] = classData.teachers;

    if (newUser.userType == "student"){
        studentIDs = [...studentIDs, newUser.email]
    }
    else {
        teacherIDs = [...teacherIDs, newUser.email]
    }

    const updatedClass: data.Class = {
        classID: classID,
        title: classData.title,
        sourceID: classData.sourceID,
        students: studentIDs,
        teachers: teacherIDs
    };

    await updateClass(updatedClass);
    await setUser(newUser)
        .then(() => {
            console.log(`Received req: ${req.body}`);
            res.send({ success: true, receivedInput: req.body });
        })
        .catch((error) => {
            console.error("Error signing up user:", error);
            res.status(500).send({ success: false, error: error.message });
        });
};