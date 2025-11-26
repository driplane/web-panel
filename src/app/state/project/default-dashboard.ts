import { Dashboard } from "./project.reducer";

export default {
  id: 'default',
  title: 'Dashboard',
  mainEvent: 'hit',
  cards: [
    {
      style: 'chart',
      size: {
        md: 6,
        xs: 12,
      },
      data: [{
        event: 'hit',
        title: 'Hits',
        op: 'count',
      }]
    },
    // {
    //   style: 'chart',
    //   size: {
    //     md: 6,
    //     xs: 12,
    //   },
    //   data: [{
    //     event: 'hit',
    //     title: 'Clients',
    //     op: 'unique',
    //     tag: 'visitor',
    //   }]
    // },
    {
      style: 'chart',
      size: {
        md: 6,
        xs: 12,
      },
      data: [{
        event: 'hit',
        title: 'Bandwidth',
        op: 'total',
        tag: 'srv_size',
        valueFormat: 'filesize',
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
        event: 'hit',
        op: 'total',
        tag: 'srv_size',
        filters: {group_by: 'service'},
        title: 'Top Bandwidth by Service',
        dataLabel: 'Service',
        valueFormat: 'filesize',
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
        event: 'hit',
        op: 'total',
        tag: 'srv_size',
        title: 'Hotlinked Bandwidth',
        dataLabel: 'Service',
        valueLabel: 'Bandwidth',
        valueFormat: 'filesize',
        unknownLabel: '(none)',
        filters: {
          ref_ext: 1,
          category: 'static',
          group_by: 'service'
        }
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
        event: 'hit',
        tag: 'url',
        title: 'Hotlinked URLs',
        dataLabel: 'URL',
        valueLabel: 'Visitors',
        unknownLabel: '(none)',
        filters: {
          ref_ext: 1,
          category: 'static',
        }
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
        event: 'hit',
        tag: 'srv_status',
        title: 'HTTP Status Codes',
        dataLabel: 'Status',
        valueLabel: 'Visitors',
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
        event: 'hit',
        tag: 'url_host',
        title: 'Domains',
        dataLabel: 'Domain',
        valueLabel: 'Visitors',
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
        event: 'hit',
        tag: 'srv_cache',
        title: 'Cache Status',
        dataLabel: 'Cached',
        valueLabel: 'Visitors',
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
        event: 'hit',
        tag: 'url_path',
        title: 'Top URLs',
        dataLabel: 'URL',
        valueLabel: 'Visitors',
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
        event: 'hit',
        tag: 'ref_host',
        title: 'Sources',
        dataLabel: 'Source Domain',
        valueLabel: 'Visitors',
        unknownLabel: '(direct)',
        filters: {
          ref_ext: 1
        }
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
        event: 'hit',
        tag: 'ref',
        title: 'Source URLs',
        dataLabel: 'Source URL',
        valueLabel: 'Visitors',
        unknownLabel: '(none)',
        filters: {
          ref_ext: 1
        }
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
        event: 'hit',
        tag: 'country',
        title: 'Countries',
        dataLabel: 'Country',
        valueLabel: 'Visitors',
        unknownLabel: '(unknown)',
        labelFormat: 'country'
      }]
    },
    {
      style: 'toplist',
      // visible: {
      //   parent: ['country']
      // },
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'hit',
        tag: 'city',
        title: 'Cities',
        dataLabel: 'City',
        valueLabel: 'Visitors',
        unknownLabel: '(unknown)',
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
        event: 'hit',
        tag: 'category',
        title: 'Categories',
        dataLabel: 'Category',
        valueLabel: 'Hits',
        unknownLabel: '(unknown)',
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
        event: 'hit',
        tag: 'logger',
        title: 'Loggers',
        dataLabel: 'Logger',
        valueLabel: 'Hits',
        unknownLabel: '(unknown)',
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
        event: 'hit',
        tag: 'bot_name',
        title: 'Bots',
        dataLabel: 'Bot',
        valueLabel: 'Hits',
        unknownLabel: '(unknown)',
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
        event: 'hit',
        tag: 'client_type',
        title: 'Client Types',
        dataLabel: 'Client Type',
        valueLabel: 'Hits',
        unknownLabel: '(unknown)',
        filters: {
          client_type__neq: ''
        }
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
        event: 'hit',
        tag: 'client_name',
        title: 'Browsers',
        dataLabel: 'Browser',
        valueLabel: 'Visitors',
        unknownLabel: '(unknown)',
        filters: {
          client_type: 'browser'
        }
      }, {
        event: 'hit',
        tag: 'os_name',
        title: 'Operating Systems',
        dataLabel: 'Operating System',
        valueLabel: 'Visitors',
        unknownLabel: '(other)',
      }]
    },
    {
      style: 'toplist',
      visible: {
        parent: ['client_name']
      },
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'hit',
        tag: 'client_version',
        title: 'Browsers Versions',
        dataLabel: 'Browser Version',
        valueLabel: 'Visitors',
        unknownLabel: '(unknown)',
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
        event: 'hit',
        tag: 'device_type',
        title: 'Device Types',
        dataLabel: 'Device Type',
        valueLabel: 'Visitors',
        unknownLabel: '(unknown)',
      }, {
        event: 'hit',
        tag: 'device_vendor',
        title: 'Vendors',
        dataLabel: 'Vendor',
        valueLabel: 'Visitors',
        unknownLabel: '(other)',
      }, {
        event: 'hit',
        tag: 'device_model',
        title: 'Models',
        dataLabel: 'Model',
        valueLabel: 'Visitors',
        unknownLabel: '(other)',
      }]
    },
    // {
    //   style: 'webvitals',
    //   size: {
    //     size: 12,
    //   },
    //   data: []
    // },
    // {
    //   style: 'gauge',
    //   size: {
    //     size: 12
    //   },
    //   title: 'Performance',
    //   data: [{
    //     event: 'hit',
    //     tag: 'ttfb',
    //     op: 'avg',
    //     dataLabel: 'TTFB',
    //     valueFormat: 'number:1.0-0',
    //     sections: [800, 1800]
    //   }]
    // }
  ]
} as Dashboard;
