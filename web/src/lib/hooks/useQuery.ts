import { useLocation } from 'react-router-dom';

// A custom hook that builds on useLocation to parse
// the query string for you.
// Reference: https://reactrouter.com/web/example/query-parameters
const useQuery = () => new URLSearchParams(useLocation().search);

export default useQuery;
