
// Component để hiển thị các khuyến nghị từ mô hình ML
const MLRecommendations = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Không có khuyến nghị nào từ mô hình
      </div>
    );
  }

  // Hàm để lấy màu dựa trên mức độ ưu tiên
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-red-50",
          title: "text-red-800",
          text: "text-red-700",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
        };
      case "medium":
        return {
          bg: "bg-yellow-50",
          title: "text-yellow-800",
          text: "text-yellow-700",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-blue-50",
          title: "text-blue-800",
          text: "text-blue-700",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
    }
  };

  // Hàm lấy biểu tượng cho danh mục
  const getCategoryIcon = (category) => {
    switch (category) {
      case "attendance":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "academic":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
        );
      case "financial":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-lg font-medium">Khuyến nghị từ ML</h3>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          Dựa trên dữ liệu thực
        </span>
      </div>

      {recommendations.map((recommendation, index) => {
        const styles = getPriorityStyles(recommendation.priority);
        return (
          <div
            key={index}
            className={`p-4 ${styles.bg} rounded-lg border border-l-4 ${
              recommendation.priority === "high"
                ? "border-l-red-500"
                : recommendation.priority === "medium"
                ? "border-l-yellow-500"
                : "border-l-blue-500"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">{styles.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${styles.title} flex items-center`}>
                    {getCategoryIcon(recommendation.category)}
                    <span className="ml-1">{recommendation.title}</span>
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recommendation.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : recommendation.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {recommendation.priority === "high"
                      ? "Ưu tiên cao"
                      : recommendation.priority === "medium"
                      ? "Ưu tiên trung bình"
                      : "Ưu tiên thấp"}
                  </span>
                </div>
                <p className={`text-sm ${styles.text} mt-1`}>
                  {recommendation.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MLRecommendations;
