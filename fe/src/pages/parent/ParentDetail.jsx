import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PERMISSIONS, useAuth } from "../../context/AuthContext";
import { fetchParentById } from "../../services/api";
import { formatDate } from "../../utils/formatters";

const ParentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [parent, setParent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setIsLoading(true);

        // In a real application, you would call the API:
        const response = await fetchParentById(id);
        setParent(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching parent data:", error);
        setError("Failed to load parent details");
        setIsLoading(false);
      }
    };

    fetchParentData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      try {
        // In a real application, you would call the API:
        // await parentAPI.delete(id);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        navigate("/parents", {
          state: { message: "Parent deleted successfully" },
        });
      } catch (error) {
        console.error("Error deleting parent:", error);
        alert("Failed to delete parent. Please try again.");
      }
    }
  };

  const formatRelation = (relation) => {
    return relation.charAt(0).toUpperCase() + relation.slice(1);
  };

  const formatEducationLevel = (level) => {
    if (!level) return "Not specified";

    switch (level) {
      case "primary":
        return "Primary School";
      case "secondary":
        return "Secondary School";
      case "high_school":
        return "High School";
      case "college":
        return "College";
      case "university":
        return "University";
      case "post_graduate":
        return "Post Graduate";
      case "none":
        return "None";
      default:
        return level.charAt(0).toUpperCase() + level.slice(1);
    }
  };

  const formatIncome = (income) => {
    if (!income && income !== 0) return "Not specified";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(income);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Parent not found.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{parent.user?.full_name || "N/A"}</h1>
          <p className="text-gray-600">
            {formatRelation(parent.relation_to_student)} of{" "}
            <Link
              to={`/students/${parent.student_id}`}
              className="text-blue-600 hover:underline"
            >
              {parent.student?.user?.full_name || "N/A"}
            </Link>
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {hasPermission(PERMISSIONS.PARENT_EDIT) && (
            <Link
              to={`/parents/edit/${parent.parent_id}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </Link>
          )}
          {hasPermission(PERMISSIONS.PARENT_DELETE) && (
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Parent Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Parent Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{parent.user?.full_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Relation to Student</p>
            <p className="font-medium">{formatRelation(parent.relation_to_student)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{parent.user?.username || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{parent.user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{parent.user?.phone || "N/A"}</p>
          </div>
          {parent.phone_secondary && (
            <div>
              <p className="text-sm text-gray-500">Secondary Phone</p>
              <p className="font-medium">{parent.phone_secondary}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{parent.address || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Occupation</p>
            <p className="font-medium">
              {parent.occupation || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Education Level</p>
            <p className="font-medium">
              {formatEducationLevel(parent.education_level)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Income</p>
            <p className="font-medium">{formatIncome(parent.income)}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>Created at: {formatDate(parent.user?.created_at)}</p>
          <p>Last updated: {formatDate(parent.user?.updated_at)}</p>
        </div>
      </div>

      {/* Student Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Student Information</h2>
          <Link
            to={`/students/${parent.student_id}`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View Full Profile
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
          <div>
            <p className="text-sm text-gray-500">Student Name</p>
            <p className="font-medium">{parent.student?.user?.full_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Student ID</p>
            <p className="font-medium">{parent.student?.student_code || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date of Birth</p>
            <p className="font-medium">{parent.student?.date_of_birth || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Entry Year</p>
            <p className="font-medium">{parent.student?.entry_year || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Attendance Rate</p>
            <p className="font-medium">{parent.student?.attendance_rate ? `${parent.student.attendance_rate}%` : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Academic Status</p>
            <p className="font-medium">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                ${
                  parent.student?.academic_status === "good"
                    ? "bg-green-100 text-green-800"
                    : parent.student?.academic_status === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : parent.student?.academic_status === "suspended"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {parent.student?.academic_status 
                  ? parent.student.academic_status.charAt(0).toUpperCase() + parent.student.academic_status.slice(1)
                  : "N/A"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDetail;
