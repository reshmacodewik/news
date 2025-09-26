import NetInfo from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'

const useCheckInternetConnection = () => {
    const [isOffline, setOfflineStatus] = useState(false)

    useEffect(() => {
        const removeNetInfoSubscription = NetInfo.addEventListener((state: any) => {
            const offline = !(state.isConnected && state.isInternetReachable)
            setOfflineStatus(offline)
        })

        return () => removeNetInfoSubscription()
    }, [])

    return isOffline
}

export default useCheckInternetConnection
