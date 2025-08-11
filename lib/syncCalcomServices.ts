import fetch from "node-fetch";

const CALCOM_API_URL = "https://api.cal.com/v1";
const CALCOM_API_KEY = "cal_live_385c7e606106c6d27db04b6f9aae2536"; // your key here

interface Service {
  id: string;
  name: string;
  max_bookings_per_slot: number;
  duration_minutes: number;
}

interface CalComEventType {
  id: string;
  name: string;
  slug: string;
  capacity: number;
  duration: number;
  // other fields if needed
}

async function createCalEventType(service: Service): Promise<CalComEventType> {
  if (!CALCOM_API_KEY) {
    throw new Error("Cal.com API key is missing");
  }

  const payload = {
    title: service.name,
    capacity: service.max_bookings_per_slot,
    length: service.duration_minutes,
    slug: service.name.toLowerCase().replace(/\s+/g, "-"),
  };

  const url = `${CALCOM_API_URL}/event-types?apiKey=${CALCOM_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cal.com API error: ${errorText}`);
  }

  const data: CalComEventType = await response.json();
  return data;
}


async function main() {
  const dummyService: Service = {
    id: "dummy-id",
    name: "Test Service",
    max_bookings_per_slot: 2,
    duration_minutes: 30,
  };

  try {
    console.log("Creating event type on Cal.com with dummy data...");
    const createdEvent = await createCalEventType(dummyService);
    console.log("Success! Created event type:", createdEvent);
  } catch (error) {
    console.error("Failed to create Cal.com event type:", error);
  }
}

main();
