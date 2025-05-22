import { useEffect, useState } from "react";
import { Link } from "react-router";
import DataTable from "../../components/common/DataTable";
import { PERMISSIONS, useAuth } from "../../context/AuthContext";
import { fetchParents } from "../../services/api";

const ParentList = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = useAuth();
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 100,
  });
  useEffect(() => {
    const getParents = async () => {
      try {
        setLoading(true);

        // In a real application, this would be replaced by:
        const response = await fetchParents(filters);
        setParents(response.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching parents:", error);
        setError("Failed to load parents");
        setLoading(false);
        // For development, use mock data if API fails
        setParents([]);
      }
    };

    getParents();
  }, []);

  const formatRelation = (relation) => {
    return relation.charAt(0).toUpperCase() + relation.slice(1);
  };

  // Define columns for data table
  const columns = [
    { 
      header: "Parent Name", 
      accessor: (row) => row.user?.full_name || "N/A" 
    },
    {
      header: "Contact Information",
      accessor: (row) => (
        <div>
          <div>{row.user?.email}</div>
          <div>{row.user?.phone}</div>
          {row.phone_secondary && <div>{row.phone_secondary}</div>}
        </div>
      ),
    },
    {
      header: "Relation",
      accessor: (row) => formatRelation(row.relation_to_student),
    },
    {
      header: "Occupation & Education",
      accessor: (row) => (
        <div>
          <div>{row.occupation || "N/A"}</div>
          <div className="text-sm text-gray-500">
            {row.education_level ? row.education_level.charAt(0).toUpperCase() + row.education_level.slice(1) : "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Student",
      accessor: (row) => (
        <div>
          <div>{row.student?.user?.full_name || "N/A"}</div>
          <div className="text-sm text-gray-500">{row.student?.student_code || "N/A"}</div>
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex space-x-2">
          {hasPermission(PERMISSIONS.PARENT_VIEW) && (
            <Link
              to={`/parents/${row.parent_id}`}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              View
            </Link>
          )}
          {hasPermission(PERMISSIONS.PARENT_EDIT) && (
            <Link
              to={`/parents/edit/${row.parent_id}`}
              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Edit
            </Link>
          )}
        </div>
      ),
    },
  ];

  if (loading)
    return <div className="flex justify-center p-8">Loading parents...</div>;

  if (error)
    return (
      <div className="bg-red-100 p-4 text-red-700 rounded-md">{error}</div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Parents</h1>
        {hasPermission(PERMISSIONS.PARENT_CREATE) && (
          <Link
            to="/parents/new"
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add New Parent
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={parents}
          pagination={true}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
};

export default ParentList;
