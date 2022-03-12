import React from 'react';

import CardOptionsStore from './CardOptionsStore';

const StoreContext = React.createContext(new CardOptionsStore());

export default StoreContext;
