import { useNavigate } from 'react-router-dom'
import { FaBook, FaBookReader, FaCog, FaQuestionCircle } from 'react-icons/fa'
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
      case 'help':
        return <FaQuestionCircle />
      default:
        return null
    }
  }

  const handleResultClick = (result) => {
    onResultClick() // Close search results
    navigate(result.link)
  }

  return (
    <div className="search-results">
      {Object.entries(results).map(([category, items]) => {
        if (items.length === 0) return null

        return (
          <div key={category} className="result-category">
            <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            <ul>
              {items.map((item) => (
                <li key={item.id} onClick={() => handleResultClick(item)}>
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
