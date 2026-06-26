import { sb } from './supabaseClient.js';

async function loadSlot() {
    const { data, error } = await sb
        .from('site_settings')
        .select('status,total_slot')
        .eq('id', 1)
        .single();

    if (error || !data) {
        console.error(error);
        return;
    }

    const slotText = document.getElementById('slotText');
    if (!slotText) return;

    const current = Number(data.status ?? 0);
    const total = Number(data.total_slot ?? 0);

    slotText.classList.remove('slot-open', 'slot-full');

    if (current >= total) {
        slotText.textContent = 'FULL';
        slotText.classList.add('slot-full');
    } else {
        slotText.textContent = `${current} / ${total} OPEN`;
        slotText.classList.add('slot-open');
    }

    document.querySelectorAll('.slot-icons img').forEach((img, index) => {
        img.src = index < current
            ? 'images/slot-on.png'
            : 'images/slot-off.png';
    });
}

document.addEventListener('DOMContentLoaded', loadSlot);