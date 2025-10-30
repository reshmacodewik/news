import { useEffect, useState } from 'react';
import { getApiWithOutQuery } from '../Utils/api/common';
import { API_DOMAIN_LIST } from '../Utils/api/APIConstant';

interface Domain {
  _id: string;
  name?: string;
  type: number;
  [key: string]: any;
}

export const useDomainByType = (type: number | string) => {
  const [domainId, setDomainId] = useState<string>('');
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loadingDomain, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDomains = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getApiWithOutQuery({ url: API_DOMAIN_LIST });
        const list: Domain[] =
          (Array.isArray(res?.data) && res.data) ||
          (Array.isArray(res?.data?.data) && res.data.data) ||
          [];

        const matched = list.find(val => val?.type === type);
        setDomainId(matched?._id ?? '');
        setDomain(matched ?? null);
      } catch (err: any) {
        setError('Failed to fetch domain list');
        setDomainId('');
        setDomain(null);
      } finally {
        
        setLoading(false);
      }
    };

    getDomains();
  }, [type]);

  return { domainId, domain, loadingDomain, error };
};
