import 'dotenv/config'; // Explicitly load .env from root
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env is loaded from the root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename, '../'); // Move up from /src/ to root
import('dotenv').then(dotenv => dotenv.config({ path: path.join(__dirname, '.env') }));

// Manually fetch environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Check your .env file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define bucket and base URL
const bucket = 'player-images';
const storageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}`;

async function updatePlayerImageUrls() {
  // Fetch all players
  const { data: players, error } = await supabase.from('players_base').select('id, name');

  if (error) {
    console.error('❌ Error fetching players:', error.message);
    return;
  }else{
    console.log("Fetched players ", players);
  }

  // Update each player's image_url
  for (const player of players) {
    const imageUrl = `${storageUrl}/${encodeURIComponent(player.name)}.png`; // Assuming filenames match player_id

    const { error: updateError } = await supabase
      .from('players_base')
      .update({ image_url: imageUrl })
      .eq('id', player.id);

    if (updateError) {
      console.error(`❌ Error updating player ${player.name}:`, updateError.message);
    } else {
      console.log(`✅ Updated player ${player.name} with ${imageUrl}`);
    }
  }
}

updatePlayerImageUrls();

