import { useState } from "react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { userService } from "./../../services/userService";
import { useToast } from "./../../context/ToastContext";
import { useAuth } from "./../../context/AuthContext";
import { ConfirmDialog } from "./../../ui/ConfirmDialog";
import { Pagination } from "./../../ui/Pagination";

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const params = {};
    if (search) {
      params.search = search;
    }
    if (page) {
      params.page = page;
    }
    setSearchParams(params);
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users with token:", token);
      const data = await userService.getUsers(token, page, search);
      console.log(data, "fetched users");
      setUsers(data.users);
      console.log("Pagination data:", data.pagination);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Toggle Status
  const toggleUserStatus = async (id) => {
    try {
      const response = await userService.toggleStatus(id, token);

      // Use Toast
      showToast(response.message, "success");

      // Refresh the users listing state
      fetchUsers();
    } catch (error) {
      console.error("Toggle status error", error);
    }
  };

  const deleteUser = (id) => {
    setUserToDelete(id);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await userService.deleteUser(userToDelete, token);
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== userToDelete),
        );
        showToast("User deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
      } finally {
        setUserToDelete(null);
        setDialogOpen(false);
      }
    }
  };
  return (
    <>
      <div className="flex justify-end mb-4">
        <Link
          to="/users/create"
          className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
        >
          Create User
        </Link>
      </div>

      <div className="bg-white shadow rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold mb-4">Users List</h2>

          <div className="flex items-center gap-3">
            {/* Bulk Delete Action Button */}
            {/* {selectedUsers.length > 0 && (
              <button
                onClick={bulkDeleteUsers}
                className="cursor-pointer h-[40px] w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete Users ({selectedUsers.length})
              </button>
            )} */}

            {/* Dropdown for Status filter */}
            {/* <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-[40px] px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="1">Active</option>
              <option value="0">In-active</option>
            </select> */}

            {/* Search filter */}
            <input
              type="text"
              value={search}
              placeholder="Search users..."
              className="h-[40px] w-full max-w-sm px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            {/* Clear Button */}
            {/* {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPage("1");
                }}
                className="px-3 py-2 bg-gray-600 text-white cursor-pointer hover:bg-gray-700 rounded"
              >
                Clear
              </button>
            )} */}
          </div>
        </div>
        {/* Users Listing */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {/* Select All */}
              {/* <th className="border border-gray-200 p-2 text-left">
                <div className="flex items-center gap-1 group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer accent-blue-500"
                    // checked={selectedUsers.length === users.length}
                    checked={
                      users.length > 0 &&
                      users.every((user) => selectedUsers.includes(user.id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </div>
              </th> */}

              <th
                // onClick={() => handleSort("id")}
                className="cursor-pointer border border-gray-200 p-2 text-left"
              >
                <div className="flex items-center gap-1 group">
                  ID
                  {/* ID {renderSortIcons("id")} */}
                </div>
              </th>
              <th
                // onClick={() => handleSort("name")}
                className="cursor-pointer border border-gray-200 p-2 text-left"
              >
                <div className="flex items-center gap-1 group">
                  Name
                  {/* Name {renderSortIcons("name")} */}
                </div>
              </th>
              <th
                // onClick={() => handleSort("email")}
                className="cursor-pointer border border-gray-200 p-2 text-left"
              >
                <div className="flex items-center gap-1 group">
                  Email
                  {/* Email {renderSortIcons("email")} */}
                </div>
              </th>
              <th
                // onClick={() => handleSort("created_at")}
                className="cursor-pointer border border-gray-200 p-2 text-left"
              >
                <div className="flex items-center gap-1 group">
                  {" "}
                  Created At
                  {/* Created At {renderSortIcons("created_at")} */}
                </div>
              </th>

              <th
                // onClick={() => handleSort("status")}
                className="cursor-pointer border border-gray-200 p-2 text-left"
              >
                <div className="flex items-center gap-1 group">
                  {" "}
                  Status
                  {/* Status {renderSortIcons("status")} */}
                </div>
              </th>

              <th className="border border-gray-200 p-2 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {users &&
              users.map((user) => (
                <tr key={user.id}>
                  {/* Checkbox - Select User */}
                  {/* <td className="border border-gray-200 p-2 text-left">
                    <div className="flex items-center gap-1 group">
                      <input
                        type="checkbox"
                        className="w-5 h-5 cursor-pointer accent-blue-500"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </div>
                  </td> */}

                  <td className="border border-gray-200 p-2 text-left">
                    {user.id}
                  </td>
                  <td className="border border-gray-200 p-2 text-left">
                    {user.name}
                  </td>
                  <td className="border border-gray-200 p-2 text-left">
                    {user.email}
                  </td>
                  <td className="border border-gray-200 p-2 text-left">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  {/* Status */}
                  <td className="border border-gray-200 p-2 text-left">
                    <span
                      className={`px-2 py-1 rounded border ${user.status === 1 ? "bg-green-200 text-green-700 border-green-500" : "bg-gray-200 text-gray-600 border-gray-500"}`}
                    >
                      {user.status ? "Active" : "In-active"}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="border border-gray-200 p-2 text-left">
                    <div className="flex gap-2">
                      <Link
                        to={`/users/${user.id}`}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1 rounded cursor-pointer"
                      >
                        View
                      </Link>
                      {/* Edit user */}
                      <Link
                        to={`/users/${user.id}/edit`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Edit
                      </Link>
                      {/* Delete user */}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded cursor-pointer"
                      >
                        Delete
                      </button>
                      {/* Status Action */}
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`${user.status ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"} text-white px-3 py-1 rounded cursor-pointer`}
                      >
                        {user.status ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Custom Pagination */}
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.total_pages}
          onPageChange={(page) => setPage(page)}
          from={pagination.from}
          to={pagination.to}
          total={pagination.total_pages}
        />
      </div>

      {/* Confirm Dialog Component */}
      <ConfirmDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </>
  );
};
