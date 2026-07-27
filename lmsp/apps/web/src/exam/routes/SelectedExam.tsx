import React from "react";
import {
  FiClock,
  FiPlayCircle,
  FiCalendar,
  FiChevronRight,
} from "react-icons/fi";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const exams = [
  {
    id: 1,
    title: "48th BCS Preliminary",
    status: "Completed",
    live: false,
    date: "20 July 2026",
  },
  {
    id: 2,
    title: "49th BCS Preliminary",
    status: "Upcoming",
    live: false,
    date: "15 August 2026",
  },
  {
    id: 3,
    title: "50th BCS Preliminary",
    status: "Live Now",
    live: true,
    date: "Ends in 02:15:42",
  },
];

const SelectedExam = () => {
    const location = useLocation()
    const navigate = useNavigate()


  return (
<div>
    {
        location.pathname === '/mock-exam/selected-exam'? (
                <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Select an Exam
        </h1>

        <p className="text-gray-500 mb-8">
          Choose an ongoing or upcoming BCS examination.
        </p>

        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              onClick={()=> navigate('exam-page')}
              className="bg-white rounded-xl shadow-sm border hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between p-5">

                <div className="flex items-center gap-4">
                  <div
                    className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                      exam.live
                        ? "bg-green-100 text-green-600"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    {exam.live ? (
                      <FiPlayCircle size={28} />
                    ) : (
                      <FiCalendar size={28} />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      {exam.title}
                    </h2>

                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <FiClock />
                      {exam.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">

                  {exam.live ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                      ● LIVE
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        exam.status === "Upcoming"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {exam.status}
                    </span>
                  )}

                  <FiChevronRight
                    size={22}
                    className="text-gray-400"
                  />
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
        ):
        (
            <div>
                <Outlet />
            </div>
        )
    }
</div>
  );
};

export default SelectedExam;