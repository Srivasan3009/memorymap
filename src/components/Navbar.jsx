import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';

export function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark"><Brain size={19} /></span>
          MemoryMap
        </Link>
        <div className="nav-links">
          <NavLink to="/create" className={({ isActive }) => `nav-link hide-mobile ${isActive ? 'active' : ''}`}>
            Create Map
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link hide-mobile ${isActive ? 'active' : ''}`}>
            Progress
          </NavLink>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
            + New Map
          </button>
        </div>
      </div>
    </nav>
  );
}