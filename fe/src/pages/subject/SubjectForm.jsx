// File: SubjectForm.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  createSubject,
  fetchSubjectById,
  updateSubject,
} from "../../services/api";

const SubjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    subject_code: "",
    subject_name: "",
    subject_description: "",
    department: "",
    credits: "",
    credits_theory: "",
    credits_practice: "",
    prerequisite_subjects: "",
    syllabus_link: "",
  });
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Mock departments list for dropdown
  const departments = [
    "Computer Science",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Humanities",
    "Social Sciences",
  ];

  // Fetch subject data for edit mode
  useEffect(() => {
    const fetchSubjectData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await fetchSubjectById(id);
          const subjectData = response?.data || {};
          setFormData({
            subject_code: subjectData.subject_code || "",
            subject_name: subjectData.subject_name || "",
            subject_description: subjectData.subject_description || "",
            department: subjectData.department || "",
            credits: subjectData.credits || "",
            credits_theory: subjectData.credits_theory || "",
            credits_practice: subjectData.credits_practice || "",
            prerequisite_subjects: subjectData.prerequisite_subjects || "",
            syllabus_link: subjectData.syllabus_link || "",
          });
          setLoading(false);
        } catch (err) {
          console.error("Error fetching subject data:", err);
          setError("Failed to fetch subject data");
          setLoading(false);
          // Fallback to mock data for development
          setFormData({
            subject_code: "CS101",
            subject_name: "Introduction to Programming",
            subject_description:
              "Neque repellendus libero dolore tempore ipsum nulla. Maiores aliquid facere provident provident. Error ipsum recusandae esse blanditiis.",
            department: "Computer Science",
            credits: 3,
            credits_theory: 1.8,
            credits_practice: 1.2,
            prerequisite_subjects: "",
            syllabus_link: "/syllabi/CS101.pdf",
          });
        }
      }
    };

    if (isEditMode) {
      fetchSubjectData();
    }
  }, [id, isEditMode]);

  // Handle input changes for text, number, and select fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setSyllabusFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate credits
      const totalCredits = parseFloat(formData.credits || 0);
      const theoryCredits = parseFloat(formData.credits_theory || 0);
      const practiceCredits = parseFloat(formData.credits_practice || 0);
      if (theoryCredits + practiceCredits > totalCredits) {
        throw new Error(
          "Theory + Practice credits cannot exceed total credits"
        );
      }

      // Prepare form data for API
      const formDataToSend = new FormData();
      formDataToSend.append("subject_code", formData.subject_code);
      formDataToSend.append("subject_name", formData.subject_name);
      formDataToSend.append(
        "subject_description",
        formData.subject_description
      );
      formDataToSend.append("department", formData.department);
      formDataToSend.append("credits", formData.credits);
      formDataToSend.append("credits_theory", formData.credits_theory);
      formDataToSend.append("credits_practice", formData.credits_practice);
      formDataToSend.append(
        "prerequisite_subjects",
        formData.prerequisite_subjects || ""
      );
      if (syllabusFile) {
        formDataToSend.append("syllabus", syllabusFile);
      }

      if (isEditMode) {
        await updateSubject(id, formDataToSend);
      } else {
        await createSubject(formDataToSend);
      }
      navigate("/subjects");
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message || "Failed to save subject data");
      setSubmitting(false);

      // Simulate success for development
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          navigate("/subjects");
        }, 1000);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Loading subject data...</div>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link
          to="/subjects"
          className="mr-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to Subjects
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? "Edit Subject" : "Create New Subject"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label
                htmlFor="subject_name"
                className="block text-gray-700 font-medium mb-2"
              >
                Subject Name*
              </label>
              <input
                type="text"
                id="subject_name"
                name="subject_name"
                value={formData.subject_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="subject_code"
                className="block text-gray-700 font-medium mb-2"
              >
                Subject Code*
              </label>
              <input
                type="text"
                id="subject_code"
                name="subject_code"
                value={formData.subject_code}
                onChange={handleInputChange}
                placeholder="e.g., CS101"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="department"
                className="block text-gray-700 font-medium mb-2"
              >
                Department*
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select a department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="credits"
                className="block text-gray-700 font-medium mb-2"
              >
                Total Credits*
              </label>
              <input
                type="number"
                id="credits"
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                min="1"
                max="10"
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="credits_theory"
                className="block text-gray-700 font-medium mb-2"
              >
                Theory Credits*
              </label>
              <input
                type="number"
                id="credits_theory"
                name="credits_theory"
                value={formData.credits_theory}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="credits_practice"
                className="block text-gray-700 font-medium mb-2"
              >
                Practice Credits*
              </label>
              <input
                type="number"
                id="credits_practice"
                name="credits_practice"
                value={formData.credits_practice}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="prerequisite_subjects"
                className="block text-gray-700 font-medium mb-2"
              >
                Prerequisite Subjects
              </label>
              <input
                type="text"
                id="prerequisite_subjects"
                name="prerequisite_subjects"
                value={formData.prerequisite_subjects}
                onChange={handleInputChange}
                placeholder="e.g., MATH101, CS100"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="syllabus"
                className="block text-gray-700 font-medium mb-2"
              >
                Syllabus File
              </label>
              <input
                type="file"
                id="syllabus"
                name="syllabus"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {formData.syllabus_link && (
                <a
                  href={formData.syllabus_link}
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Current Syllabus
                </a>
              )}
            </div>

            <div className="mb-4 md:col-span-2">
              <label
                htmlFor="subject_description"
                className="block text-gray-700 font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="subject_description"
                name="subject_description"
                value={formData.subject_description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Link
              to="/subjects"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : isEditMode
                ? "Update Subject"
                : "Create Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm;
