import React from 'react'
import { useSearchParams } from 'react-router-dom'
import PaperTypeSelection from '../../../ExamPaper/papertypeSelection/PaperTypeSelection';

const Exampage = () => {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get('examId') || '';
  const versionId = searchParams.get('versionId') || '';
  const board = searchParams.get('board');
  const scheduleId = searchParams.get('scheduleId') || '';

  return (
    <div>
      <PaperTypeSelection examId={examId} board={board} versionId={versionId} scheduleId={scheduleId} />
    </div>
  );
};

export default Exampage;
