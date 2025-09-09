import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized">
      <h1>401 - Unauthorized</h1>
      <p>You don't have permission to access this resource.</p>
      <Link to="/" className="back-link">Return to Dashboard</Link>
    </div>
  );
};

export default Unauthorized;