import React, { useState } from 'react'
import Omer from '../omr/Omr';
import QuizPreatise from '../ExamPaper';
import { useLocation } from 'react-router-dom';

interface PaperTypeSelectionProps {
  examId: string;
  board: string | null;
  versionId: string;
}

const PaperTypeSelection: React.FC<PaperTypeSelectionProps> = ({ examId, board, versionId }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
    const [clicked,setClicked] = useState<boolean>(false)
  const renderComponent = (key: string | null) => {
    switch (key) {
      case 'Type1':
        return <Omer examId={examId} board={board} versionId={versionId}/>;
      case 'Type2':
        return <QuizPreatise examId={examId} board={board} versionId={versionId} />;
      default:
        return null;
    }
  };
  

  return (
    <div className="min-h-screen bg-[#1c1f26] flex flex-col items-center justify-center  text-white">
<div className={`${clicked?'hidden':'block'}`}>
          <h2 className="text-2xl font-bold mb-6">Choose your preferred method</h2>
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => {setSelectedType('Type1');setClicked(true)}}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedType === 'Type1'
              ? 'bg-emerald-600 text-white shadow-lg scale-105'
              : 'bg-[#222734] border border-[#373e4f] text-gray-200 hover:bg-[#2c3345]'
          }`}
        >
          OMR Sheet (Type 1)
        </button>
        <button
          onClick={() => {setSelectedType('Type2');setClicked(true)}}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            selectedType === 'Type2'
              ? 'bg-emerald-600 text-white shadow-lg scale-105'
              : 'bg-[#222734] border border-[#373e4f] text-gray-200 hover:bg-[#2c3345]'
          }`}
        >
          Digital Quiz (Type 2)
        </button>
      </div>
</div>
      {renderComponent(selectedType)}
    </div>
  );
};

export default PaperTypeSelection;