  const dash = {
    id: 'default',
    title: 'Dashboard',
    mainEvent: 'image_view',
    cards: [
      {
        style: 'chart',
        size: {
          md: 6,
          xs: 12,
        },
        data: [{
          event: 'image_view',
          title: 'Image Views',
          op: 'count',
        }]
      },
      {
        style: 'chart',
        size: {
          md: 6,
          xs: 12,
        },
        data: [{
          event: 'image_view',
          title: 'Bandwidth',
          tag: 'size',
          op: 'total',
          valueFormat: 'filesize'
        }]
      },
      {
        style: 'toplist',
        size: {
          lg: 3,
          md: 4,
          sm: 12
        },
        data: [{
          event: 'image_view',
          tag: 'account',
          title: 'Accounts',
          dataLabel: 'Account',
          valueLabel: 'Image Views',
        }]
      },
      {
        style: 'toplist',
        size: {
          lg: 3,
          md: 4,
          sm: 12
        },
        data: [{
          event: 'image_view',
          tag: 'distribution',
          title: 'Distributions',
          dataLabel: 'Distribution',
          valueLabel: 'Image Views',
        }]
      },
      {
        style: 'toplist',
        size: {
          lg: 3,
          md: 4,
          sm: 12
        },
        data: [{
          event: 'image_view',
          tag: 'host',
          title: 'Domains',
          dataLabel: 'Domain',
          valueLabel: 'Image Views',
        }]
      },
      {
        style: 'toplist',
        size: {
          lg: 3,
          md: 4,
          sm: 12
        },
        data: [{
          event: 'image_view',
          tag: 'ref_host',
          title: 'Serving Hosts',
          dataLabel: 'Domain',
          valueLabel: 'Image Views',
        }]
      },
    ]
  };


localStorage.setItem('dashboard', JSON.stringify(dash));
