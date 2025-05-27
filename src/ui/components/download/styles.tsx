export const styles = {
  downloadContainer: {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '20px',
    border: '1px solid #ccc',
  },
  downloadHeader: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  downloadList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  downloadItem: {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  downloadItemName: {
    display: 'block',
    padding: '10px 20px',
    backgroundColor: '#eee',
    textDecoration: 'none',
    color: '#000',
    maxWidth: '80%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  downloadItemLinkHover: {
    backgroundColor: '#ddd',
  },
  downloadItemLink: {},
  downloadAllButton: {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    margin: '10px 0', // Added margin for spacing
  },
};
