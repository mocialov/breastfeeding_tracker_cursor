import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { FeedingSession, LiveSession } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface FeedingState {
  sessions: FeedingSession[];
  liveSession: LiveSession | null;
  isLoading: boolean;
}

type FeedingAction =
  | { type: 'ADD_SESSION'; payload: FeedingSession }
  | { type: 'UPDATE_SESSION'; payload: FeedingSession }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_SESSIONS'; payload: FeedingSession[] }
  | { type: 'START_LIVE_SESSION'; payload: LiveSession }
  | { type: 'UPDATE_LIVE_SESSION'; payload: Partial<LiveSession> }
  | { type: 'END_LIVE_SESSION'; payload: FeedingSession }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: FeedingState = {
  sessions: [],
  liveSession: null,
  isLoading: false,
};

function feedingReducer(state: FeedingState, action: FeedingAction): FeedingState {
  switch (action.type) {
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
      };
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(session => session.id !== action.payload),
      };
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
      };
    case 'START_LIVE_SESSION':
      return {
        ...state,
        liveSession: action.payload,
      };
    case 'UPDATE_LIVE_SESSION':
      return {
        ...state,
        liveSession: state.liveSession
          ? { ...state.liveSession, ...action.payload }
          : null,
      };
    case 'END_LIVE_SESSION':
      return {
        ...state,
        liveSession: null,
        sessions: [action.payload, ...state.sessions],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

interface FeedingContextType {
  state: FeedingState;
  addSession: (session: FeedingSession) => Promise<void>;
  updateSession: (session: FeedingSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  startLiveSession: (breastType: string, bottleVolume?: number) => void;
  updateLiveSession: (updates: Partial<LiveSession>) => void;
  endLiveSession: (endTime: Date, notes?: string) => Promise<void>;
  getSessionsByDate: (date: Date) => FeedingSession[];
  getDailySummary: (date: Date) => any;
  refreshSessions: () => Promise<void>;
  testSupabaseConnection: () => Promise<void>;
}

const FeedingContext = createContext<FeedingContextType | undefined>(undefined);

export function FeedingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(feedingReducer, initialState);
  const { user } = useAuth();

  const loadSessions = useCallback(async () => {
    if (!user) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { data, error } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      const sessions: FeedingSession[] = data.map(row => ({
        id: row.id,
        startTime: new Date(row.start_time),
        endTime: row.end_time ? new Date(row.end_time) : undefined,
        duration: row.duration,
        breastType: row.breast_type,
        bottleVolume: row.bottle_volume,
        notes: row.notes,
        isActive: row.is_active,
      }));

      dispatch({ type: 'SET_SESSIONS', payload: sessions });
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  // Load data from Supabase on mount and when user changes
  useEffect(() => {
    if (user) {
      loadSessions();
    } else {
      // Clear sessions when user logs out
      dispatch({ type: 'SET_SESSIONS', payload: [] });
    }
  }, [user, loadSessions]);

  const addSession = async (session: FeedingSession) => {
    console.log('addSession called with:', session);
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found, cannot add session');
      return;
    }

    try {
      console.log('Inserting session into Supabase...');
      // Validate duration - must be > 0 and <= 480 (8 hours in minutes)
      const validatedDuration = session.duration && session.duration > 0 && session.duration <= 480
        ? session.duration
        : null;

      if (!validatedDuration) {
        console.error('Invalid duration:', session.duration);
        throw new Error('Duration must be greater than 0 and less than or equal to 480 minutes (8 hours)');
      }

      const insertData = {
        id: session.id,
        user_id: user.id,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime?.toISOString() || null,
        duration: validatedDuration,
        breast_type: session.breastType,
        bottle_volume: session.bottleVolume || null,
        notes: session.notes || null,
        is_active: session.isActive || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.log('Insert data:', insertData);
      console.log('Data types:', {
        id: typeof insertData.id,
        user_id: typeof insertData.user_id,
        start_time: typeof insertData.start_time,
        end_time: typeof insertData.end_time,
        duration: typeof insertData.duration,
        breast_type: typeof insertData.breast_type,
        bottle_volume: typeof insertData.bottle_volume,
        notes: typeof insertData.notes,
        is_active: typeof insertData.is_active
      });
      console.log('Notes validation:', {
        notesLength: insertData.notes?.length || 0,
        notesRequired: insertData.notes ? 'Yes' : 'No',
        meetsMinimum: insertData.notes ? insertData.notes.length >= 500 : 'N/A'
      });
      
      console.log('Attempting Supabase insert...');
      console.log('Supabase client:', !!supabase);
      console.log('Table name: feeding_sessions');
      
      const { data, error } = await supabase
        .from('feeding_sessions')
        .insert(insertData)
        .select();
      
      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error adding session:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Session inserted successfully, dispatching ADD_SESSION');
      dispatch({ type: 'ADD_SESSION', payload: session });
      console.log('ADD_SESSION dispatched');
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  };

  const updateSession = async (session: FeedingSession) => {
    if (!user) return;

    try {
      // Validate duration - must be > 0 and <= 480 (8 hours in minutes)
      const validatedDuration = session.duration && session.duration > 0 && session.duration <= 480
        ? session.duration
        : null;

      if (!validatedDuration) {
        console.error('Invalid duration for update:', session.duration);
        throw new Error('Duration must be greater than 0 and less than or equal to 480 minutes (8 hours)');
      }

      const { error } = await supabase
        .from('feeding_sessions')
        .update({
          start_time: session.startTime.toISOString(),
          end_time: session.endTime?.toISOString() || null,
          duration: validatedDuration,
          breast_type: session.breastType,
          bottle_volume: session.bottleVolume,
          notes: session.notes,
          is_active: session.isActive || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating session:', error);
        throw error;
      }

      dispatch({ type: 'UPDATE_SESSION', payload: session });
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  };

  const deleteSession = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('feeding_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting session:', error);
        throw error;
      }

      dispatch({ type: 'DELETE_SESSION', payload: id });
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  };

  const startLiveSession = (breastType: string, bottleVolume?: number) => {
    const liveSession: LiveSession = {
      id: uuidv4(),
      startTime: new Date(),
      currentBreast: breastType as any,
      bottleVolume,
      isPaused: false,
      pausedTime: 0,
      totalTime: 0,
    };
    dispatch({ type: 'START_LIVE_SESSION', payload: liveSession });
  };

  const updateLiveSession = (updates: Partial<LiveSession>) => {
    dispatch({ type: 'UPDATE_LIVE_SESSION', payload: updates });
  };

  const endLiveSession = async (endTime: Date, notes?: string) => {
    console.log('endLiveSession called with:', { endTime, notes, liveSession: state.liveSession });
    
    if (!state.liveSession) {
      console.log('No live session to end');
      return;
    }

    const duration = Math.round((endTime.getTime() - state.liveSession.startTime.getTime()) / 60000);

    // Validate duration - must be at least 1 minute to comply with database constraint
    const validatedDuration = Math.max(1, duration);

    console.log('Calculated duration:', duration, 'minutes, validated duration:', validatedDuration, 'minutes');

    const session: FeedingSession = {
      id: state.liveSession.id,
      startTime: state.liveSession.startTime,
      endTime,
      duration: validatedDuration,
      breastType: state.liveSession.currentBreast,
      bottleVolume: state.liveSession.bottleVolume,
      notes,
      isActive: false,
    };

    console.log('Created session object:', session);

    try {
      console.log('Adding session to Supabase...');
      await addSession(session);
      console.log('Session added successfully, dispatching END_LIVE_SESSION');
      dispatch({ type: 'END_LIVE_SESSION', payload: session });
      console.log('END_LIVE_SESSION dispatched');
    } catch (error) {
      console.error('Error ending live session:', error);
      throw error;
    }
  };

  const getSessionsByDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return state.sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfDay && sessionDate <= endOfDay;
    });
  };

  const getDailySummary = (date: Date) => {
    const sessions = getSessionsByDate(date);
    const summary = {
      date: date.toISOString().split('T')[0],
      totalSessions: sessions.length,
      totalTime: 0,
      leftBreastTime: 0,
      rightBreastTime: 0,
      bottleTime: 0,
      bottleVolume: 0,
    };

    sessions.forEach(session => {
      if (session.duration) {
        summary.totalTime += session.duration;
        
        if (session.breastType === 'left') {
          summary.leftBreastTime += session.duration;
        } else if (session.breastType === 'right') {
          summary.rightBreastTime += session.duration;
        } else if (session.breastType === 'bottle') {
          summary.bottleTime += session.duration;
          if (session.bottleVolume) {
            summary.bottleVolume += session.bottleVolume;
          }
        }
      }
    });

    return summary;
  };

  const refreshSessions = async () => {
    await loadSessions();
  };

  // Test function to verify Supabase connection and permissions
  const testSupabaseConnection = async () => {
    if (!user) {
      console.log('No user authenticated');
      return;
    }

    try {
      console.log('Testing Supabase connection...');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      
      // Test simple query to verify connection
      const { data: testData, error: testError } = await supabase
        .from('feeding_sessions')
        .select('id')
        .limit(1);
      
      console.log('Test query result:', { testData, testError });
      
      if (testError) {
        console.error('Test query failed:', testError);
      } else {
        console.log('Test query successful - Supabase connection working');
      }
    } catch (error) {
      console.error('Test connection failed:', error);
    }
  };

  const value: FeedingContextType = {
    state,
    addSession,
    updateSession,
    deleteSession,
    startLiveSession,
    updateLiveSession,
    endLiveSession,
    getSessionsByDate,
    getDailySummary,
    refreshSessions,
    testSupabaseConnection,
  };

  return (
    <FeedingContext.Provider value={value}>
      {children}
    </FeedingContext.Provider>
  );
}

export function useFeeding() {
  const context = useContext(FeedingContext);
  if (context === undefined) {
    throw new Error('useFeeding must be used within a FeedingProvider');
  }
  return context;
}
