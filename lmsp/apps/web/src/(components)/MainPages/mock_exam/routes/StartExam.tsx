import React from 'react'
import { useSearchParams } from 'react-router-dom'
import QuizPreatise from '../../../QuizPreatise/QuizPreatise'

const Exampage = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId') || '';
  const versionId = searchParams.get('versionId') || '';
  const board = searchParams.get('board')
  // console.log(searchParams.get('board'),'tt')
  return (
    <div>
      <QuizPreatise examId={examId} board={board} versionId={versionId} />
    </div>
  )
}

export default Exampage
