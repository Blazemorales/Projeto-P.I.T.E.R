import React from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
)

// Minimal working Line chart component with sample data.
// Chart.js v4 + react-chartjs-2 v5 expect `options` and `data` props.
export const Linegraph = ({ options, data }) => {
    // Provide sensible defaults so the component never crashes when used without props.
    const defaultOptions = options || {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Exemplo de Gráfico de Linhas' },
        },
    }

    const defaultData = data || {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Série exemplo',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
            },
        ],
    }

    return <Line options={defaultOptions} data={defaultData} />
}

export default Linegraph