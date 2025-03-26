import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const { id } = params;

  // Önce o oyuncuya ait tüm bitme kayıtlarını sil
  const { error: finishError } = await supabase
    .from('finishes')
    .delete()
    .eq('player_id', id);

  if (finishError) {
    return NextResponse.json({ error: finishError.message }, { status: 500 });
  }

  // Sonra oyuncunun kendisini sil
  const { error: playerError } = await supabase
    .from('players')
    .delete()
    .eq('id', id);

  if (playerError) {
    return NextResponse.json({ error: playerError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Oyuncu ve bitme kayıtları silindi' });
}
