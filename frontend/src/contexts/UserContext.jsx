import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase_client';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const u = data?.user;
                if (u) {
                    setUser(u);
                    setUserEmail(u.email);

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('name')
                        .eq('id', u.id)
                        .single();

                    setUserName(profile?.name || u.email.split('@')[0]);
                }
            } catch (e) {
                console.error('error loading user:', e);
            } finally {
                setLoading(false);
            }
        };

        load();

        // update on auth state change (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setUserEmail(session.user.email);
                // refetch profile name
                supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data: profile }) => {
                        setUserName(profile?.name || session.user.email.split('@')[0]);
                    });
            } else {
                setUser(null);
                setUserName('');
                setUserEmail('');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // allow profile page to update the cached name
    const updateUserName = (newName) => setUserName(newName);

    return (
        <UserContext.Provider value={{ user, userName, userEmail, loading, updateUserName }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
