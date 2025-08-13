import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import StarsModal from '../features/stars/ui/StarsModal';

const meta: Meta<typeof StarsModal> = {
  title: 'Stars/StarsModal',
  component: StarsModal,
};
export default meta;

type Story = StoryObj<typeof StarsModal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <StarsModal
        open={open}
        onClose={() => setOpen(false)}
        balance={{ amount: 849 }}
        historyApi={{ fetch: async (filter, page) => ({ items: Array.from({ length: 12 }, (_, i)=>({ id:`op-${i}`, title: i%2?'Зачисление':'Покупка', subtitle: 'тест', date: 'сегодня', sign: i%2?'+':'-', amount: 100+i })), nextPage: 2 }) }}
        purchaseApi={{ list: async () => ([{ id:'p100', qty:100, price:99 }, { id:'p250', qty:250, price:249 }, { id:'p500', qty:500, price:499 }, { id:'p1000', qty:1000, price:999 }, { id:'p2500', qty:2500, price:2390 }, { id:'p10000', qty:10000, price:9290 }, { id:'p50000', qty:50000, price:43900 }, { id:'p150000', qty:150000, price:129900 }, { id:'p2500b', qty:2500, price:2490 }]), buy: async ()=>{} }}
        giftApi={{ searchContacts: async (q, page) => ({ items: Array.from({ length: 10 }, (_, i)=>({ id:`c-${i}`, name:`Контакт ${i+1}` })) }), startGift: async ()=>{} }}
      />
    );
  }
};

