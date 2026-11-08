export type Workout = {
  _id: string;
  title: string;
  trainer: { _id: string; username: string };
  startTime: string;
  durationMinutes: number;
  capacity: number;
  enrolledCount: number;
};

export type WorkoutInput = {
  title: string;
  trainer: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
};

export type Enrollment = {
  _id: string;
  workout: { _id: string; title: string; startTime: string };
  user: { _id: string; username: string };
};