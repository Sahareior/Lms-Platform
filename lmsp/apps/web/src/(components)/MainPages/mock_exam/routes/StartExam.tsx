import React from 'react'
import { useSearchParams } from 'react-router-dom'
import QuizPreatise from '../../../ExamPaper/ExamPaper'
import PaperTypeSelection from '../../../ExamPaper/papertypeSelection/PaperTypeSelection';

const Exampage = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId') || '';
  const versionId = searchParams.get('versionId') || '';
  const board = searchParams.get('board')
  // console.log(searchParams.get('board'),'tt')
  return (
    <div>
     <PaperTypeSelection examId={examId} board={board} versionId={versionId} />

    </div>
  )
}

export default Exampage
