import React from "react";
import {
  FaGraduationCap,
  FaBookOpen,
  FaCalendarAlt,
  FaClipboardList,
  FaUniversity,
  FaBookmark,
  FaBook,
  FaUserGraduate,
  FaClock,
  FaVideo,
  FaFilePdf,
  FaUsers,
  FaMoon,
  FaBell,
  FaBars,
} from "react-icons/fa";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const examItems = [
  {
    title: "ফ্রি সার্ভিস মডেল টেস্ট",
    icon: <FaGraduationCap />,
    dot: false,
  },
  {
    title: "৪৯তম বিসিএস প্রস্তুতি",
    icon: <FaUniversity />,
    dot: true,
  },
  {
    title: "বিসিএস প্রস্তুতি",
    icon: <FaBookmark />,
    dot: false,
  },
  {
    title: "প্রিলি ও লিখিত সম্মিলিত প্রস্তুতি",
    icon: <FaBookOpen />,
    dot: false,
  },
  {
    title: "সাপ্তাহিক টেস্ট",
    icon: <FaBook />,
    dot: false,
  },
  {
    title: "জব সল্যুশন",
    icon: <FaCalendarAlt />,
    dot: false,
  },
  {
    title: "ব্যাংক নিয়োগ প্রস্তুতি",
    icon: <FaClipboardList />,
    dot: true,
  },
  {
    title: "শিক্ষক নিয়োগ ও নিবন্ধন",
    icon: <FaUserGraduate />,
    dot: true,
  },
  {
    title: "১৯-২০তম গ্রেডের প্রস্তুতি",
    icon: <FaBookOpen />,
    dot: true,
  },
  {
    title: "ব্যার কাউন্সিল ও বিচার বিভাগ",
    icon: <FaUniversity />,
    dot: false,
  },
  {
    title: "স্পেশাল বিসিএস (শিক্ষা)",
    icon: <FaGraduationCap />,
    dot: false,
  },
  {
    title: "স্পেশাল বিসিএস (স্বাস্থ্য)",
    icon: <FaGraduationCap />,
    dot: true,
  },
  {
    title: "ম্যাপ ও জিওগ্রাফি",
    icon: <FaClock />,
    dot: true,
  },
];

const studyItems = [
  {
    title: "Video Section",
    icon: <FaVideo />,
  },
  {
    title: "PDF Section",
    icon: <FaFilePdf />,
  },
  {
    title: "সাম্প্রতিক পোস্ট",
    icon: <FaBookOpen />,
  },
  {
    title: "Central Job Solutions",
    icon: <FaBookOpen />,
  },
  {
    title: "Study Group",
    icon: <FaUsers />,
  },
];

const ExamOptions = () => {
    const navigate = useNavigate()
    const location = useLocation()

  return (
   <div>
    {
        location.pathname === '/mock-exam' ? (
             <div className="min-h-screen ">
      <div className="mx-auto max-w-6xl rounded-xl bg-white shadow-md">

        {/* Header */}
    

        {/* Exam */}
        <div className="p-5">
          <h2 className="mb-4 text-center text-3xl font-bold font-serif">
            Exam Section
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examItems.map((item, index) => (
              <div
              onClick={()=> navigate('selected-exam')}
                key={index}
                className="relative flex items-center gap-3 rounded-lg border bg-white px-4 py-3 transition hover:bg-gray-50 hover:shadow"
              >
                <span className="text-gray-600">{item.icon}</span>

                <span className="flex-1 text-gray-800">{item.title}</span>

                {item.dot && (
                  <span className="absolute right-4 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                )}
              </div>
            ))}
          </div>

          {/* Study Section */}
          <div className="mt-8 rounded-xl border">
            <h2 className="border-b py-4 text-center text-3xl font-bold font-serif">
              Study Section
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {studyItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 border-b px-4 py-4 last:border-b-0 hover:bg-gray-50"
                >
                  <span className="text-gray-600">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
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

export default ExamOptions;