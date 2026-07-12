const { matchRoutes } = require('react-router-dom');

const routes = [
  {
    path: "/admin/*",
    children: [
      { path: "batches" },
      { path: "batches/:id/track" },
      { path: "*" }
    ]
  }
];

const match = matchRoutes(routes, "/admin/batches/93842333-9c2b-4ec2-aa56-8377a2772796/track");
console.log(match ? match.map(m => m.route.path) : 'no match');
