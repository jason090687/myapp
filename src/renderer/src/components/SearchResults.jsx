import { useNavigate } from 'react-router-dom'
import {
  FaBook,
  FaBookReader,
  FaCog,
  FaQuestionCircle,
  FaUserGraduate,
  FaUserTie
} from 'react-icons/fa'
import './SearchResults.css'

const SearchResults = ({ results, onResultClick }) => {
  const navigate = useNavigate()

  const getIcon = (type) => {
    switch (type) {
      case 'book':
        return <FaBook />
      case 'borrowed':
        return <FaBookReader />
      case 'setting':
        return <FaCog />
      case 'student':
        return <FaUserGraduate />
      case 'staff':
        return <FaUserTie />
      case 'help':
        return <FaQuestionCircle />
      default:
        return null
    }
  }

  const handleResultClick = (result) => {
    onResultClick() // Close search results
    const target = result?.link || result?.path
    if (target) navigate(target)
  }

  if (!results) return null

  const entries = Object.entries(results).map(([category, items]) => [
    category,
    Array.isArray(items) ? items : []
  ])
  const hasAny = entries.some(([, items]) => items.length > 0)

  return (
    <div className="search-results">
      {!hasAny && <div className="result-empty">No results found</div>}

      {entries.map(([category, items]) => {
        if (items.length === 0) return null

        return (
          <div key={category} className="result-category">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <ul>
              {items.map((item) => (
                <li
                  key={item.id ?? `${category}-${item.title}`}
                  onClick={() => handleResultClick(item)}
                >
                  <span className="result-icon">{getIcon(item.type)}</span>
                  <div className="result-content">
                    <div className="result-title">{item.title}</div>
                    <div className="result-subtitle">{item.subtitle}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default SearchResults
