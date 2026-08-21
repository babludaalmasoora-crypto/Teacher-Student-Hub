import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper for Gemini AI client
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API endpoint: Generate AI Parent-Teacher Conference Dossier & Insights
  app.post('/api/generate-student-insights', async (req, res) => {
    try {
      const { student, grades, attendance, behaviors, pastMeetings } = req.body;

      if (!student) {
        return res.status(400).json({ error: 'Student data is required' });
      }

      const genAI = getGenAI();
      if (!genAI) {
        // Return structured intelligent fallback if API key is not configured
        const gpa = grades && grades.length > 0
          ? (grades.reduce((acc: number, g: any) => acc + (g.percentage || 75), 0) / grades.length).toFixed(1)
          : 'N/A';
        const attendanceRate = attendance && attendance.length > 0
          ? ((attendance.filter((a: any) => a.status === 'present').length / attendance.length) * 100).toFixed(0)
          : '100';

        return res.json({
          summary: `${student.name} is currently showing an overall average of ${gpa}% with an attendance rate of ${attendanceRate}%. Demonstrates strong potential in coursework and classroom collaboration.`,
          academicStrengths: [
            grades?.find((g: any) => g.percentage >= 85)?.subject
              ? `Demonstrates high proficiency in ${grades.find((g: any) => g.percentage >= 85).subject}.`
              : 'Shows active curiosity during class discussions.',
            'Consistently submits core assignments on time.',
            'Engages thoughtfully with new learning material.'
          ],
          growthAreas: [
            'Continue building confidence when tackling complex problem sets.',
            'Focus on consistent study habits prior to end-of-term evaluations.',
            'Encourage raising questions whenever clarity is needed.'
          ],
          behavioralObservations: behaviors?.length > 0
            ? `Recent logs indicate ${behaviors.filter((b: any) => b.type === 'positive').length} positive recognitions.`
            : 'Displays respectful classroom conduct and interacts well with peers.',
          recommendedHomeActionPlan: [
            'Set aside 20–30 minutes of daily quiet reading or revision time at home.',
            'Regularly review weekly assignment feedback on the portal.',
            'Praise diligence and perseverance on challenging subjects.'
          ],
          suggestedConferenceTalkingPoints: [
            `Discuss ${student.name}'s key academic milestones this term.`,
            'Align on joint home and school support strategies for upcoming assessments.',
            'Celebrate positive peer interactions and creative contributions.'
          ]
        });
      }

      const prompt = `You are an empathetic, experienced master educator preparing a comprehensive, structured briefing for a Parent-Teacher Conference regarding student:
Student Name: ${student.name}
Grade/Class: ${student.grade || 'Grade 5'}
Special Notes / Interests: ${student.notes || 'None noted'}

Academic Record:
${JSON.stringify(grades || [], null, 2)}

Attendance Record:
${JSON.stringify(attendance || [], null, 2)}

Behavior & Observational Logs:
${JSON.stringify(behaviors || [], null, 2)}

Previous Parent Meeting Logs:
${JSON.stringify(pastMeetings || [], null, 2)}

Please return a JSON object with the following schema:
{
  "summary": "A 2-3 sentence overarching pedagogical summary of the student's progress and mindset",
  "academicStrengths": ["List of 3 specific academic strengths grounded in the data"],
  "growthAreas": ["List of 2-3 actionable growth areas for improvement"],
  "behavioralObservations": "A compassionate 2-sentence synthesis of classroom demeanor, collaboration, and focus",
  "recommendedHomeActionPlan": ["List of 3 tangible steps parents can take at home to support the child"],
  "suggestedConferenceTalkingPoints": ["List of 3-4 structured talking points for the upcoming parent meeting"]
}
Respond strictly with valid JSON only. Do not include markdown code block formatting.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        }
      });

      const responseText = response.text || '{}';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      return res.json(parsedData);
    } catch (err: any) {
      console.error('Error generating student insights:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate insights' });
    }
  });

  // API endpoint: Generate Student Letter / Email to Parent
  app.post('/api/generate-parent-letter', async (req, res) => {
    try {
      const { student, tone, topic, keyPoints } = req.body;
      const genAI = getGenAI();

      if (!genAI) {
        return res.json({
          letter: `Dear ${student.parentName || 'Parent / Guardian'},\n\nI am writing to share a brief update on ${student.name}'s wonderful journey in our class this term. ${student.name} has been participating thoughtfully and making commendable progress. Thank you for your continued partnership in supporting their learning.\n\nWarm regards,\nClass Teacher`
        });
      }

      const prompt = `Write a professional, warm, and constructive teacher-to-parent communication letter or email.
Student: ${student.name}
Parent/Guardian: ${student.parentName || 'Parent/Guardian'}
Tone: ${tone || 'Encouraging and professional'}
Topic: ${topic || 'Term Progress & Invitation for Parent-Teacher Discussion'}
Specific Details to include: ${keyPoints || 'General progress, positive participation, and partnership.'}

Keep the message concise, constructive, uplifting, and centered on student growth. Return pure plain text.`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.6,
        }
      });

      return res.json({ letter: response.text });
    } catch (err: any) {
      console.error('Error generating letter:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Teacher Portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
