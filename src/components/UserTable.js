import React, { useState, useEffect } from 'react';
import "./UserTable.css"; 

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const usersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditedUser(user);
  };

  const handleDeleteClick = (id) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
  };

  const handleSaveClick = () => {
    const updatedUsers = users.map(user =>
      user.id === editingUserId ? editedUser : user
    );
    setUsers(updatedUsers);
    setEditingUserId(null);
  };

  const handleDeleteSelected = () => {
    const updatedUsers = users.filter(user => !selectedUsers.includes(user.id));
    setUsers(updatedUsers);
    setSelectedUsers([]);
  };

  const handleCheckboxChange = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const renderPagination = () => (
    <div className="pagination">
      <button
        className="first-page"
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        «
      </button>
      <button
        className="previous-page"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={page === currentPage ? 'active' : ''}
          aria-label={`Page ${page}`}
        >
          {page}
        </button>
      ))}
      <button
        className="next-page"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        ›
      </button>
      <button
        className="last-page"
        onClick={() => setCurrentPage(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        »
      </button>
    </div>
  );

  return (
    <div className="container">
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <input
            type="text"
            placeholder="Search by name, email or role"
            className="search-icon"
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Search"
          />
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedUsers.length === currentUsers.length}
                    aria-label="Select all on current page"
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                      aria-label={`Select ${user.name}`}
                    />
                  </td>
                  <td>
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={e => setEditedUser({ ...editedUser, name: e.target.value })}
                        aria-label={`Edit name of ${user.name}`}
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editedUser.email}
                        onChange={e => setEditedUser({ ...editedUser, email: e.target.value })}
                        aria-label={`Edit email of ${user.email}`}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editedUser.role}
                        onChange={e => setEditedUser({ ...editedUser, role: e.target.value })}
                        aria-label={`Edit role of ${user.role}`}
                      />
                    ) : (
                      user.role
                    )}
                  </td>
                  <td>
                    {editingUserId === user.id ? (
                      <button className="save" onClick={handleSaveClick} aria-label="Save changes">
                        Save
                      </button>
                    ) : (
                      <>
                        <button className="edit" onClick={() => handleEditClick(user)} aria-label="Edit user">
                          Edit
                        </button>
                        <button className="delete" onClick={() => handleDeleteClick(user.id)} aria-label="Delete user">
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination()}
          <button className="delete-selected" onClick={handleDeleteSelected} aria-label="Delete selected users">
            Delete Selected
          </button>
        </>
      )}
    </div>
  );
};

export default UserTable;
