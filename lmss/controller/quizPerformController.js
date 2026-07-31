import quizPerform from "../models/QuizPerformance.js"


export const postQuizPerformance = async (req, res) => {
    try {
        const quizPerformance = new quizPerform(req.body)
        await quizPerformance.save()
        res.status(201).json(quizPerformance);
    }
    catch (err) {
        res.status(500).json({ message: 'Unable to create quizPerformance' });
    }
}

export const getQuizPerformance = async(req,res) =>{
    try{
        const quizPerformance = await quizPerform.find()
        res.status(200).json(quizPerformance);
    }
    catch(err){
        res.status(500).json({ message: 'Unable to get quizPerformance' });
    }
}
