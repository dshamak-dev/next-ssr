import React, { useCallback, useMemo } from 'react';
import { ProfileNavigation } from '../../modules/navigation/ProfileNavigation';

export const SessionPage = () => {
  return (<main>
    <ProfileNavigation backUrl="/" />
  </main>);
};

export default SessionPage;