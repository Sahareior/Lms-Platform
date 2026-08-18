import React from 'react'
import { useSearchParams } from 'react-router-dom'
import QuizPreatise from '../../../QuizPreatise/QuizPreatise'

const Exampage = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId') || '';
  const versionId = searchParams.get('versionId') || '';

  return (
    <div>
      <QuizPreatise examId={examId} versionId={versionId} />
    </div>
  )
}

export default Exampage
