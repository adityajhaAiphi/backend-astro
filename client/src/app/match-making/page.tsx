'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calculator } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material';

interface MatchReport {
  Embeddings: number[];
  KutaScore: number;
  Notes: string;
  PredictionList: {
    Name: string;
    Nature: 'Good' | 'Bad' | 'Neutral' | 'Empty';
    MaleInfo: string;
    FemaleInfo: string;
    Info: string;
    Description: string;
  }[];
  Summary: {
    HeartIcon: string;
    ScoreColor: string;
    ScoreSummary: string;
  };
}

interface ApiResponse {
  Status: string;
  Payload: {
    MatchReport: MatchReport;
  };
}

interface BirthDetails {
  location: string;
  date: Date | null;
  time: string;
}

export default function MatchMakingPage() {
  const [maleBirthDetails, setMaleBirthDetails] = useState<BirthDetails>({
    location: '',
    date: null,
    time: '12:00'
  });

  const [femaleBirthDetails, setFemaleBirthDetails] = useState<BirthDetails>({
    location: '',
    date: null,
    time: '12:00'
  });

  const [matchData, setMatchData] = useState<MatchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateMatch = async () => {
    if (!maleBirthDetails.date || !femaleBirthDetails.date) return;
    
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `https://vedastro.azurewebsites.net/api/Calculate/MatchReport/` +
        `Location/${encodeURIComponent(maleBirthDetails.location)}/` +
        `Time/${maleBirthDetails.time}/${format(maleBirthDetails.date, 'dd/MM/yyyy')}/+05:30/` +
        `Location/${encodeURIComponent(femaleBirthDetails.location)}/` +
        `Time/${femaleBirthDetails.time}/${format(femaleBirthDetails.date, 'dd/MM/yyyy')}/+05:30/`
      );

      if (!response.ok) {
        throw new Error('Failed to calculate match');
      }

      const data: ApiResponse = await response.json();
      setMatchData(data.Payload.MatchReport);
    } catch (err) {
      console.error('Error calculating match:', err);
      setError('Failed to calculate match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const BirthDetailsForm = ({ details, setDetails, title }: { 
    details: BirthDetails; 
    setDetails: (details: BirthDetails) => void;
    title: string;
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="calendar-wrapper rounded-lg overflow-hidden shadow-md">
          <Calendar
            onChange={(value) => setDetails({
              ...details,
              date: value instanceof Date ? value : null
            })}
            value={details.date}
            className="border-none w-full"
            tileClassName="text-gray-800 hover:bg-orange-100"
          />
        </div>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Birth Place
            </label>
            <input
              type="text"
              value={details.location}
              onChange={(e) => setDetails({
                ...details,
                location: e.target.value
              })}
              className="w-full p-2 border-2 border-orange-200 rounded-lg
                      focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter birth place"
            />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Birth Time
            </label>
            <input
              type="time"
              value={details.time}
              onChange={(e) => setDetails({
                ...details,
                time: e.target.value
              })}
              className="w-full p-2 border-2 border-orange-200 rounded-lg
                      focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <label className="block text-sm font-medium text-gray-700">
              Selected Date
            </label>
            <div className="text-lg font-medium text-gray-900">
              {details.date ? details.date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Please select a date'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMatchResults = () => {
    if (!matchData) return null;

    const score = Math.round((matchData.KutaScore / 36) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        {/* Easy Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Easy</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Couple:</span>
              <span>{maleBirthDetails.location}</span>
              <span className="text-2xl">❤️</span>
              <span>{femaleBirthDetails.location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold">Score:</span>
              <span className="text-3xl font-bold" style={{ color: matchData.Summary.ScoreColor }}>
                {score}%
              </span>
            </div>

            <div>
              <span className="font-semibold">Summary:</span>
              <p className="text-gray-700">{matchData.Summary.ScoreSummary}</p>
            </div>
          </div>
        </div>

        {/* Advanced Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Advanced</h2>
          <table className="w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {matchData.PredictionList.filter(pred => pred.Name !== 'Empty').map((prediction, index) => (
                <tr key={prediction.Name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-3 border-b">
                    <div className="font-medium">{prediction.Name}</div>
                    <div className="text-sm text-gray-600">
                      {prediction.Description}
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    <div className={`font-bold ${
                      prediction.Nature === 'Good' ? 'text-green-600' : 
                      prediction.Nature === 'Bad' ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {prediction.Nature}
                    </div>
                    <div className="text-sm text-gray-600">
                      {prediction.Info}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Male: {prediction.MaleInfo}
                      {prediction.FemaleInfo && <> | Female: {prediction.FemaleInfo}</>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <motion.div 
        className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-lg border border-orange-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-8">
          <BirthDetailsForm 
            details={maleBirthDetails}
            setDetails={setMaleBirthDetails}
            title="Male Birth Details"
          />

          <BirthDetailsForm 
            details={femaleBirthDetails}
            setDetails={setFemaleBirthDetails}
            title="Female Birth Details"
          />

          <motion.button
            onClick={calculateMatch}
            disabled={loading || !maleBirthDetails.date || !femaleBirthDetails.date || 
                      !maleBirthDetails.location || !femaleBirthDetails.location}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-lg font-medium text-base transition-all duration-200 
                    ${loading ? 'bg-orange-400' : 'bg-gradient-to-r from-orange-500 to-amber-500'}
                    text-white shadow-lg hover:shadow-xl disabled:opacity-50 
                    disabled:cursor-not-allowed w-full`}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating Match...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Calculate Match
                </>
              )}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <AnimatePresence>
        {matchData && renderMatchResults()}
      </AnimatePresence>
    </div>
  );
} 