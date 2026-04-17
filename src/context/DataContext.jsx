import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [quizData, setQuizData] = useState([]);
  const [vrData, setVrData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    const dbRef = ref(database);
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const parsedQuiz = [];
          const parsedVR = [];

          // Parse QuizReports
          if (data.QuizReports) {
            Object.entries(data.QuizReports).forEach(([userId, sessions]) => {
              Object.entries(sessions).forEach(([sessionId, sessionData]) => {
                parsedQuiz.push({
                  userId,
                  sessionId,
                  ...sessionData
                });
              });
            });
          }

          // Parse Reports (VR Data)
          if (data.Reports) {
            Object.entries(data.Reports).forEach(([userId, sessions]) => {
              Object.entries(sessions).forEach(([sessionId, sessionData]) => {
                parsedVR.push({
                  userId,
                  sessionId,
                  ...sessionData
                });
              });
            });
          }

          setQuizData(parsedQuiz);
          setVrData(parsedVR);
          setError(null);
        }
      } catch (err) {
        console.error("Veri işleme hatası:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Firebase okuma hatası:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [retryCount]);

  // Memoized derived statistics
  const stats = useMemo(() => {
    if (loading || error || (quizData.length === 0 && vrData.length === 0)) return null;

    const uniqueUsers = new Set([
      ...quizData.map(q => q.userId),
      ...vrData.map(v => v.userId)
    ]);

    let totalQuestions = 0;
    let correctAnswers = 0;
    quizData.forEach(q => {
      totalQuestions += q.ToplamSoru || 0;
      correctAnswers += q.DogruSayisi || 0;
    });

    const successRate = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

    // Module distribution
    const moduleCounts = {};
    [...quizData, ...vrData].forEach(session => {
      const mod = session.ModulAdi || 'Bilinmeyen';
      moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
    });

    const chartData = Object.keys(moduleCounts).map(key => ({
      name: key.length > 20 ? key.substring(0, 18) + '…' : key,
      fullName: key,
      tamamlayan: moduleCounts[key]
    }));

    const pieData = [
      { name: 'Doğru', value: correctAnswers },
      { name: 'Yanlış', value: totalQuestions - correctAnswers },
    ];

    // Recent activity - last 5 sessions sorted by date
    const allSessions = [...quizData, ...vrData]
      .filter(s => s.Tarih || s.BaslangicZamani)
      .sort((a, b) => {
        const dateA = a.Tarih || a.BaslangicZamani || '';
        const dateB = b.Tarih || b.BaslangicZamani || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 5);

    return {
      totalUsers: uniqueUsers.size,
      successRate,
      totalQuizzes: quizData.length,
      totalVRSessions: vrData.length,
      totalQuestions,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      chartData,
      pieData,
      recentActivity: allSessions
    };
  }, [quizData, vrData, loading, error]);

  // Student aggregation
  const studentList = useMemo(() => {
    if (loading || error) return [];

    const studentMap = {};
    [...quizData, ...vrData].forEach(session => {
      const uId = session.userId;
      if (!studentMap[uId]) {
        studentMap[uId] = {
          id: uId,
          name: session.KullaniciAdi || 'İsimsiz Kursiyer',
          lastModule: session.ModulAdi || 'Bilinmiyor',
          score: session.FinalPuan || 0,
          time: session.Tarih || session.BitisZamani || session.BaslangicZamani || '-',
          sessionCount: 1,
          totalQuizScore: 0,
          quizCount: 0,
        };
      } else {
        studentMap[uId].sessionCount += 1;
        if (session.Tarih && session.Tarih > studentMap[uId].time) {
          studentMap[uId].time = session.Tarih;
          studentMap[uId].lastModule = session.ModulAdi;
          studentMap[uId].score = session.FinalPuan;
        }
      }

      // Track quiz averages
      if (session.FinalPuan !== undefined) {
        studentMap[uId].totalQuizScore += session.FinalPuan || 0;
        studentMap[uId].quizCount += 1;
      }
    });

    return Object.values(studentMap).map(s => ({
      ...s,
      avgScore: s.quizCount > 0 ? Math.round(s.totalQuizScore / s.quizCount) : 0
    }));
  }, [quizData, vrData, loading, error]);

  return (
    <DataContext.Provider value={{ quizData, vrData, loading, error, stats, studentList, retry }}>
      {children}
    </DataContext.Provider>
  );
};