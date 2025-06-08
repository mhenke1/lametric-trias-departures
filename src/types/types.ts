export interface LaMetricFrame {
  text: string;
  icon: string;
}

export interface LaMetricResponse {
  frames: LaMetricFrame[];
}

export interface BusDeparture {
  line: string;
  time: string;
}

export interface TriasConfig {
  endpoint: string;
  token: string;
}